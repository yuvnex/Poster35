import { db } from '../backend/src/db.ts';

const command = process.argv[2] || 'stats';

console.log('===============================================');
console.log('       POSTER35 DATABASE MANAGEMENT TOOL');
console.log('===============================================\n');

switch (command) {
  case 'stats': {
    const postersCount = db.prepare('SELECT COUNT(*) as count FROM posters').get().count;
    const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const settings = db.prepare('SELECT key, value FROM store_settings').all();

    console.log('📊 DATABASE SUMMARY:');
    console.log(`• Posters in Catalog:   ${postersCount}`);
    console.log(`• Active Categories:    ${categoriesCount}`);
    console.log(`• Total Orders Placed:  ${ordersCount}`);
    console.log(`• Registered Users:     ${usersCount}\n`);

    console.log('⚙️ STORE SETTINGS:');
    settings.forEach((s) => {
      console.log(`• ${s.key.padEnd(24)}: ${s.value}`);
    });
    break;
  }

  case 'orders': {
    const orders = db.prepare(`
      SELECT o.order_number, o.customer_name, o.customer_phone, o.total_amount, o.fulfilment_status, o.created_at
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();

    console.log(`📦 LATEST ORDERS (${orders.length}):`);
    if (orders.length === 0) {
      console.log('No orders placed yet. (Clean state)');
    } else {
      console.table(orders);
    }
    break;
  }

  case 'categories': {
    const cats = db.prepare(`
      SELECT c.name, c.slug, COUNT(p.id) as poster_count
      FROM categories c
      LEFT JOIN posters p ON p.category_id = c.id
      GROUP BY c.id
    `).all();
    console.log('📁 CATEGORIES & POSTER COUNTS:');
    console.table(cats);
    break;
  }

  case 'users': {
    const users = db.prepare('SELECT id, full_name, email, role, phone FROM users').all();
    console.log('👥 USERS / ADMINS:');
    console.table(users);
    break;
  }

  case 'clear-orders': {
    db.prepare('DELETE FROM payments').run();
    db.prepare('DELETE FROM order_items').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM cart_items').run();
    db.prepare('DELETE FROM carts').run();
    console.log('✓ All orders, items, and payments successfully cleared!');
    break;
  }

  default:
    console.log(`Unknown command: "${command}"`);
    console.log('Available commands:');
    console.log('  node scripts/db-tool.js stats        (View database overview & stats)');
    console.log('  node scripts/db-tool.js orders       (List recent orders)');
    console.log('  node scripts/db-tool.js categories   (List categories & poster count)');
    console.log('  node scripts/db-tool.js users        (List users and admin accounts)');
    console.log('  node scripts/db-tool.js clear-orders (Wipe all test orders)');
}
