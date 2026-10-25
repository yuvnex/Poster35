import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'poster35.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance and reliability
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posters (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category_id TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 35,
      image_url TEXT NOT NULL,
      is_featured INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      in_stock INTEGER DEFAULT 1,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_id TEXT UNIQUE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL,
      poster_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (poster_id) REFERENCES posters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      fulfilment_type TEXT NOT NULL DEFAULT 'PHYSICAL',
      shipping_address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      customer_notes TEXT,
      subtotal INTEGER NOT NULL,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      total_amount INTEGER NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PENDING',
      fulfilment_status TEXT NOT NULL DEFAULT 'PENDING',
      payment_method TEXT DEFAULT 'RAZORPAY',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      courier_name TEXT,
      tracking_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      poster_id TEXT NOT NULL,
      poster_title_snapshot TEXT NOT NULL,
      unit_price_snapshot INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      line_total INTEGER NOT NULL,
      image_url_snapshot TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      razorpay_order_id TEXT NOT NULL,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL,
      payment_method TEXT,
      raw_payload TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      poster_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, poster_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (poster_id) REFERENCES posters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    );
  `);

  // Default store settings
  const defaultSettings: [string, string, string][] = [
    ['default_poster_price', '35', 'Default price per poster in INR'],
    ['currency', 'INR', 'Store currency code'],
    ['delivery_fee', '0', 'Standard physical delivery fee in INR (FREE)'],
    ['free_delivery_threshold', '0', 'Order amount in INR to qualify for free shipping (0 = Free on all orders)'],
    ['cod_enabled', 'true', 'Whether Cash On Delivery is offered'],
    ['digital_fulfilment_enabled', 'true', 'Whether high-res digital downloads are offered'],
    ['store_name', 'Poster35', 'Brand store name'],
    ['store_headline', 'Your Favourite Posters. Just ₹35.', 'Homepage Hero headline'],
    ['store_subtext', 'Movies, legends, football icons and more. Find your vibe.', 'Homepage Hero subtext'],
    ['store_phone', '+91 98765 43210', 'Customer care WhatsApp / Phone'],
    ['store_email', 'orders@poster35.com', 'Store support email'],
    ['store_address', 'No. 42, Creative Art Hub, T. Nagar, Chennai, Tamil Nadu 600017', 'Store physical location']
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO store_settings (key, value, description) VALUES (?, ?, ?)');
  for (const [k, v, desc] of defaultSettings) {
    stmt.run(k, v, desc);
  }
}
