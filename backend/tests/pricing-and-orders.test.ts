import { test, describe } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { computeOrderPricing } from '../src/services/pricing.ts';

describe('Poster35 Pricing Rules Verification (₹35 Per Poster, 100% Free Delivery)', () => {
  test('1 poster must equal exactly ₹35 with ₹0 delivery fee', () => {
    const result = computeOrderPricing(1, 35, 'PHYSICAL', 0, 0);
    assert.strictEqual(result.subtotal, 35, 'Subtotal for 1 poster must be ₹35');
    assert.strictEqual(result.deliveryFee, 0, 'Delivery fee is removed, must be ₹0');
    assert.strictEqual(result.totalAmount, 35, 'Total amount must be exactly ₹35');
    assert.strictEqual(result.isFreeDelivery, true);
    assert.strictEqual(result.amountForFreeDelivery, 0);
  });

  test('2 posters must equal exactly ₹70 with ₹0 delivery fee', () => {
    const result = computeOrderPricing(2, 35, 'PHYSICAL', 0, 0);
    assert.strictEqual(result.subtotal, 70, 'Subtotal for 2 posters must be ₹70');
    assert.strictEqual(result.deliveryFee, 0);
    assert.strictEqual(result.totalAmount, 70, 'Total with free delivery must be ₹70');
  });

  test('3 posters must equal exactly ₹105 with ₹0 delivery fee', () => {
    const result = computeOrderPricing(3, 35, 'PHYSICAL', 0, 0);
    assert.strictEqual(result.subtotal, 105, 'Subtotal for 3 posters must be ₹105');
    assert.strictEqual(result.deliveryFee, 0);
    assert.strictEqual(result.totalAmount, 105);
  });

  test('5 posters must equal exactly ₹175 with ₹0 delivery fee', () => {
    const result = computeOrderPricing(5, 35, 'PHYSICAL', 0, 0);
    assert.strictEqual(result.subtotal, 175, 'Subtotal for 5 posters must be ₹175');
    assert.strictEqual(result.deliveryFee, 0, 'Shipping must be free');
    assert.strictEqual(result.totalAmount, 175, 'Grand total must be exactly ₹175');
    assert.strictEqual(result.isFreeDelivery, true);
  });

  test('10 posters must equal exactly ₹350 with ₹0 delivery fee', () => {
    const result = computeOrderPricing(10, 35, 'PHYSICAL', 0, 0);
    assert.strictEqual(result.subtotal, 350, 'Subtotal for 10 posters must be ₹350');
    assert.strictEqual(result.deliveryFee, 0, 'Shipping must be ₹0');
    assert.strictEqual(result.totalAmount, 350, 'Grand total must be ₹350');
  });

  test('Digital posters must always have ₹0 delivery fee', () => {
    const result = computeOrderPricing(1, 35, 'DIGITAL', 0, 0);
    assert.strictEqual(result.subtotal, 35);
    assert.strictEqual(result.deliveryFee, 0, 'Digital delivery must have zero delivery fees');
    assert.strictEqual(result.totalAmount, 35);
  });
});

describe('Razorpay Signature Verification Engine', () => {
  const secret = 'rzp_test_secret_12345';

  test('should verify authentic HMAC SHA256 signature', () => {
    const orderId = 'order_ABC123';
    const paymentId = 'pay_XYZ789';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const calculatedSig = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    assert.strictEqual(calculatedSig, validSignature);
  });

  test('should reject forged or tampered signatures', () => {
    const orderId = 'order_ABC123';
    const paymentId = 'pay_XYZ789';
    const tamperedSignature = 'tampered_signature_string_00000000000';

    const calculatedSig = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    assert.notStrictEqual(calculatedSig, tamperedSignature);
  });
});
