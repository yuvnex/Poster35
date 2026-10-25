import express from 'express';
import type { Request, Response } from 'express';
const Router = express.Router;
import { db } from '../db.ts';
import {
  createPaymentOrder,
  verifyPaymentSignature,
  generateTestSignature,
  IS_TEST_MODE
} from '../services/payment.ts';

const router = Router();

// Create payment order
router.post('/create-order', async (req: Request, res: Response): Promise<void> => {
  const { order_id } = req.body;

  if (!order_id) {
    res.status(400).json({ success: false, message: 'order_id is required' });
    return;
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id) as any;
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  if (order.payment_status === 'PAID') {
    res.status(400).json({ success: false, message: 'Order has already been paid' });
    return;
  }

  try {
    const paymentOrder = await createPaymentOrder(order.total_amount, 'INR', order.order_number);

    // Record razorpay order ID on order
    db.prepare('UPDATE orders SET razorpay_order_id = ? WHERE id = ?').run(paymentOrder.id, order.id);

    res.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      razorpay_order_id: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      key_id: paymentOrder.key_id,
      is_test_mode: paymentOrder.is_test_mode
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Payment initiation failed' });
  }
});

// Verify payment signature
router.post('/verify', (req: Request, res: Response): void => {
  const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_method } = req.body;

  if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ success: false, message: 'Missing required payment verification details' });
    return;
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id) as any;
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  // Prevent duplicate payment processing
  const existingPayment = db.prepare('SELECT id FROM payments WHERE razorpay_payment_id = ?').get(razorpay_payment_id);
  if (existingPayment) {
    res.json({ success: true, message: 'Payment already verified for this transaction', orderNumber: order.order_number });
    return;
  }

  const isValid = verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  });

  if (!isValid) {
    res.status(400).json({ success: false, message: 'Invalid payment signature. Payment verification failed.' });
    return;
  }

  const paymentId = `pay_${Date.now()}`;
  // Record payment in audit table
  db.prepare(`
    INSERT INTO payments (
      id, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
      amount, currency, status, payment_method, raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, 'INR', 'SUCCESS', ?, ?)
  `).run(
    paymentId,
    order.id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order.total_amount,
    payment_method || (IS_TEST_MODE ? 'TEST_GATEWAY' : 'RAZORPAY_LIVE'),
    JSON.stringify(req.body)
  );

  // Update order status to PAID and PROCESSING
  db.prepare(`
    UPDATE orders 
    SET payment_status = 'PAID', 
        fulfilment_status = 'PROCESSING',
        razorpay_payment_id = ?
    WHERE id = ?
  `).run(razorpay_payment_id, order.id);

  res.json({
    success: true,
    message: 'Payment verified and order confirmed successfully',
    orderId: order.id,
    orderNumber: order.order_number
  });
});

// Helper for frontend test checkout simulation
router.post('/simulate-test-payment', (req: Request, res: Response): void => {
  const { order_id } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id) as any;
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const razorpay_order_id = order.razorpay_order_id || `order_test_${Date.now()}`;
  const razorpay_payment_id = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const razorpay_signature = generateTestSignature(razorpay_order_id, razorpay_payment_id);

  res.json({
    success: true,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  });
});

export default router;
