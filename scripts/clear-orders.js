import { db } from '../backend/src/db.ts';

console.log('--- CLEARING ALL ORDERS & TEST TRANSACTIONS ---');

try {
  const delPayments = db.prepare('DELETE FROM payments').run();
  console.log(`✓ Removed ${delPayments.changes} payment record(s)`);

  const delOrderItems = db.prepare('DELETE FROM order_items').run();
  console.log(`✓ Removed ${delOrderItems.changes} order item snapshot(s)`);

  const delOrders = db.prepare('DELETE FROM orders').run();
  console.log(`✓ Removed ${delOrders.changes} customer order(s)`);

  const delCartItems = db.prepare('DELETE FROM cart_items').run();
  console.log(`✓ Removed ${delCartItems.changes} active cart item(s)`);

  const delCarts = db.prepare('DELETE FROM carts').run();
  console.log(`✓ Removed ${delCarts.changes} shopping cart session(s)`);

  // Verify counts
  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const orderItemsCount = db.prepare('SELECT COUNT(*) as count FROM order_items').get().count;
  const paymentsCount = db.prepare('SELECT COUNT(*) as count FROM payments').get().count;

  console.log('\n--- VERIFICATION STATUS ---');
  console.log(`Orders remaining: ${ordersCount}`);
  console.log(`Order Items remaining: ${orderItemsCount}`);
  console.log(`Payments remaining: ${paymentsCount}`);
  console.log('✓ Database orders successfully reset to 0! Ready for real customers.');
} catch (err) {
  console.error('Error clearing orders:', err.message);
  process.exit(1);
}
