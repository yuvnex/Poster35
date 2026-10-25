import express from 'express';
import type { Request, Response } from 'express';
const Router = express.Router;
import { db } from '../db.ts';
import { calculateCartPricing } from '../services/pricing.ts';
import { authenticate, optionalAuthenticate } from '../middleware/auth.ts';

const router = Router();

// Checkout: Create order
router.post('/checkout', optionalAuthenticate, (req: Request, res: Response): void => {
  const {
    items,
    customer_name,
    customer_email,
    customer_phone,
    fulfilment_type = 'PHYSICAL',
    shipping_address,
    city,
    state,
    pincode,
    customer_notes,
    payment_method = 'DIRECT_ORDER'
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    return;
  }

  if (!customer_name) {
    res.status(400).json({ success: false, message: 'Customer name is required' });
    return;
  }

  if (!customer_phone) {
    res.status(400).json({ success: false, message: 'Customer mobile phone number is required' });
    return;
  }

  // Recalculate price server-side (tamper-proof)
  const pricing = calculateCartPricing(items, fulfilment_type === 'DIGITAL' ? 'DIGITAL' : 'PHYSICAL');
  if (pricing.items.length === 0) {
    res.status(400).json({ success: false, message: 'No valid products found in cart' });
    return;
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `P35-${dateStr}-${randomSuffix}`;
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const userId = req.user?.id || null;

  // Insert Order
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, customer_name, customer_email, customer_phone,
      fulfilment_type, shipping_address, city, state, pincode, customer_notes,
      subtotal, delivery_fee, total_amount, payment_status, fulfilment_status,
      payment_method, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING', ?, CURRENT_TIMESTAMP)
  `);

  insertOrder.run(
    orderId,
    orderNumber,
    userId,
    customer_name.trim(),
    customer_email?.trim() || null,
    customer_phone.trim(),
    fulfilment_type,
    shipping_address?.trim() || null,
    city?.trim() || null,
    state?.trim() || null,
    pincode?.trim() || null,
    customer_notes?.trim() || null,
    pricing.subtotal,
    pricing.delivery_fee,
    pricing.total_amount,
    payment_method
  );

  // Insert Order Items (Frozen snapshot of title and price)
  const insertItem = db.prepare(`
    INSERT INTO order_items (
      id, order_id, poster_id, poster_title_snapshot, unit_price_snapshot,
      quantity, line_total, image_url_snapshot
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  pricing.items.forEach((item, idx) => {
    insertItem.run(
      `oi_${orderId}_${idx + 1}`,
      orderId,
      item.poster_id,
      item.title,
      item.price,
      item.quantity,
      item.line_total,
      item.image_url
    );
  });

  res.status(201).json({
    success: true,
    orderId,
    orderNumber,
    subtotal: pricing.subtotal,
    deliveryFee: pricing.delivery_fee,
    totalAmount: pricing.total_amount,
    currency: pricing.currency,
    itemsCount: pricing.total_quantity
  });
});

// Get order details by ID
router.get('/:id', (req: Request, res: Response): void => {
  const order = db.prepare(`
    SELECT * FROM orders WHERE id = ? OR order_number = ?
  `).get(req.params.id, req.params.id) as any;

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const items = db.prepare(`
    SELECT * FROM order_items WHERE order_id = ?
  `).all(order.id);

  const payments = db.prepare(`
    SELECT id, razorpay_order_id, razorpay_payment_id, amount, status, payment_method, created_at
    FROM payments WHERE order_id = ?
  `).all(order.id);

  res.json({
    success: true,
    order: {
      ...order,
      items,
      payments
    }
  });
});

// Get user order history
router.get('/user/history', authenticate, (req: Request, res: Response): void => {
  const orders = db.prepare(`
    SELECT o.*, COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all(req.user!.id);

  res.json({ success: true, orders });
});

export default router;
