import express from 'express';
import type { Request, Response } from 'express';
const Router = express.Router;
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from '../db.ts';
import { authenticate, requireAdmin } from '../middleware/auth.ts';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'poster-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// All admin routes require authentication and ADMIN role
router.use(authenticate, requireAdmin);

// Dashboard Analytics
router.get('/stats', (_req: Request, res: Response): void => {
  const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
  const verifiedRevenue = (db.prepare("SELECT COALESCE(SUM(total_amount), 0) as rev FROM orders WHERE payment_status = 'PAID'").get() as any).rev;
  const pendingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE fulfilment_status = 'PENDING'").get() as any).count;
  const totalPosters = (db.prepare('SELECT COUNT(*) as count FROM posters').get() as any).count;

  // Best selling posters
  const bestSellers = db.prepare(`
    SELECT oi.poster_id, oi.poster_title_snapshot as title, oi.image_url_snapshot as image_url,
           SUM(oi.quantity) as total_sold, SUM(oi.line_total) as total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.payment_status = 'PAID'
    GROUP BY oi.poster_id
    ORDER BY total_sold DESC
    LIMIT 5
  `).all();

  // Category distribution
  const categoryStats = db.prepare(`
    SELECT c.name, COUNT(p.id) as poster_count
    FROM categories c
    LEFT JOIN posters p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY poster_count DESC
  `).all();

  // Recent 10 orders
  const recentOrders = db.prepare(`
    SELECT o.*, COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 10
  `).all() as any[];

  const getItemsStmt = db.prepare(`
    SELECT id, poster_id, poster_title_snapshot, unit_price_snapshot, quantity, line_total, image_url_snapshot
    FROM order_items
    WHERE order_id = ?
  `);

  for (const order of recentOrders) {
    order.items = getItemsStmt.all(order.id);
  }

  res.json({
    success: true,
    stats: {
      totalOrders,
      verifiedRevenue,
      pendingOrders,
      totalPosters,
      bestSellers,
      categoryStats,
      recentOrders
    }
  });
});

// Order management: list with filters
router.get('/orders', (req: Request, res: Response): void => {
  const status = req.query.status as string;
  const paymentStatus = req.query.payment_status as string;
  const search = req.query.search as string;

  let whereClauses: string[] = ['1=1'];
  let params: any[] = [];

  if (status && status !== 'all') {
    whereClauses.push('o.fulfilment_status = ?');
    params.push(status);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    whereClauses.push('o.payment_status = ?');
    params.push(paymentStatus);
  }

  if (search) {
    whereClauses.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const query = `
    SELECT o.*, COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE ${whereClauses.join(' AND ')}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  const orders = db.prepare(query).all(...params) as any[];

  const getItemsStmt = db.prepare(`
    SELECT id, poster_id, poster_title_snapshot, unit_price_snapshot, quantity, line_total, image_url_snapshot
    FROM order_items
    WHERE order_id = ?
  `);

  for (const order of orders) {
    order.items = getItemsStmt.all(order.id);
  }

  res.json({ success: true, orders });
});

// Get single order with all item snapshots and images
router.get('/orders/:id', (req: Request, res: Response): void => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const getItemsStmt = db.prepare(`
    SELECT id, poster_id, poster_title_snapshot, unit_price_snapshot, quantity, line_total, image_url_snapshot
    FROM order_items
    WHERE order_id = ?
  `);

  order.items = getItemsStmt.all(order.id);
  res.json({ success: true, order });
});

// Update order fulfilment & tracking
router.put('/orders/:id/status', (req: Request, res: Response): void => {
  const { fulfilment_status, courier_name, tracking_number, payment_status } = req.body;

  if (!fulfilment_status && !payment_status) {
    res.status(400).json({ success: false, message: 'fulfilment_status or payment_status is required' });
    return;
  }

  if (payment_status && fulfilment_status) {
    db.prepare(`
      UPDATE orders 
      SET fulfilment_status = ?, courier_name = ?, tracking_number = ?, payment_status = ?
      WHERE id = ?
    `).run(fulfilment_status, courier_name || null, tracking_number || null, payment_status, req.params.id);
  } else if (fulfilment_status) {
    db.prepare(`
      UPDATE orders 
      SET fulfilment_status = ?, courier_name = ?, tracking_number = ?
      WHERE id = ?
    `).run(fulfilment_status, courier_name || null, tracking_number || null, req.params.id);
  } else if (payment_status) {
    db.prepare(`
      UPDATE orders 
      SET payment_status = ?
      WHERE id = ?
    `).run(payment_status, req.params.id);
  }

  res.json({ success: true, message: 'Order status updated successfully' });
});

// Create poster with upload
router.post('/posters', upload.single('image'), (req: Request, res: Response): void => {
  const { title, description, category_id, price, is_featured, is_trending, in_stock, tags } = req.body;

  if (!title || !category_id) {
    res.status(400).json({ success: false, message: 'Title and Category are required' });
    return;
  }

  let imageUrl = req.body.image_url;
  if (req.file) {
    imageUrl = `/api/posters/image/uploads/${req.file.filename}`;
  }

  if (!imageUrl) {
    res.status(400).json({ success: false, message: 'Image file or image_url is required' });
    return;
  }

  const posterId = `pst_${Date.now()}`;
  const posterSlug = `${posterId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
  const posterPrice = parseInt(price, 10) || 35;

  db.prepare(`
    INSERT INTO posters (
      id, title, slug, description, category_id, price, image_url,
      is_featured, is_trending, in_stock, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    posterId,
    title.trim(),
    posterSlug,
    description || `Premium 300 GSM Matte finish poster of ${title}. Just ₹35.`,
    category_id,
    posterPrice,
    imageUrl,
    is_featured === 'true' || is_featured === '1' || is_featured === true ? 1 : 0,
    is_trending === 'true' || is_trending === '1' || is_trending === true ? 1 : 0,
    in_stock === 'false' || in_stock === '0' || in_stock === false ? 0 : 1,
    tags || ''
  );

  res.status(201).json({ success: true, message: 'Poster created successfully', posterId });
});

// Update poster
router.put('/posters/:id', (req: Request, res: Response): void => {
  const { title, description, category_id, price, is_featured, is_trending, in_stock, tags, image_url } = req.body;

  const existing = db.prepare('SELECT * FROM posters WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ success: false, message: 'Poster not found' });
    return;
  }

  db.prepare(`
    UPDATE posters 
    SET title = ?, description = ?, category_id = ?, price = ?,
        image_url = ?, is_featured = ?, is_trending = ?, in_stock = ?, tags = ?
    WHERE id = ?
  `).run(
    title ?? existing.title,
    description ?? existing.description,
    category_id ?? existing.category_id,
    price !== undefined ? parseInt(price, 10) : existing.price,
    image_url ?? existing.image_url,
    is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
    is_trending !== undefined ? (is_trending ? 1 : 0) : existing.is_trending,
    in_stock !== undefined ? (in_stock ? 1 : 0) : existing.in_stock,
    tags ?? existing.tags,
    req.params.id
  );

  res.json({ success: true, message: 'Poster updated successfully' });
});

// Delete poster
router.delete('/posters/:id', (req: Request, res: Response): void => {
  db.prepare('DELETE FROM posters WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Poster deleted' });
});

// Batch create posters
router.post('/posters/batch', (req: Request, res: Response): void => {
  const { posters } = req.body;
  if (!Array.isArray(posters) || posters.length === 0) {
    res.status(400).json({ success: false, message: 'Posters array is required' });
    return;
  }

  const insertStmt = db.prepare(`
    INSERT INTO posters (
      id, title, slug, description, category_id, price, image_url,
      is_featured, is_trending, in_stock, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  let count = 0;
  for (const p of posters) {
    if (!p.title || !p.category_id || !p.image_url) continue;
    const id = `pst_${Date.now()}_${count}`;
    const slug = `${id}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    insertStmt.run(
      id,
      p.title,
      slug,
      p.description || `Premium 300 GSM poster of ${p.title}. Fixed ₹35.`,
      p.category_id,
      parseInt(p.price, 10) || 35,
      p.image_url,
      p.is_featured ? 1 : 0,
      p.is_trending ? 1 : 0,
      p.tags || ''
    );
    count++;
  }

  res.json({ success: true, count, message: `Successfully added ${count} posters` });
});

// Category management: Add new category without modifying code
router.post('/categories', (req: Request, res: Response): void => {
  const { name, description, image_url } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Category name is required' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `cat_${slug}`;

  db.prepare(`
    INSERT OR REPLACE INTO categories (id, slug, name, description, image_url, display_order)
    VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories))
  `).run(id, slug, name.trim(), description || '', image_url || '');

  res.status(201).json({ success: true, message: 'Category created', id, slug });
});

// Update category
router.put('/categories/:id', (req: Request, res: Response): void => {
  const { name, description, image_url, display_order } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }

  db.prepare(`
    UPDATE categories 
    SET name = ?, description = ?, image_url = ?, display_order = ?
    WHERE id = ?
  `).run(
    name ?? existing.name,
    description ?? existing.description,
    image_url ?? existing.image_url,
    display_order !== undefined ? parseInt(display_order, 10) : existing.display_order,
    req.params.id
  );

  res.json({ success: true, message: 'Category updated successfully' });
});

// Delete category
router.delete('/categories/:id', (req: Request, res: Response): void => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Category deleted successfully' });
});

// Store settings: Get all
router.get('/settings', (_req: Request, res: Response): void => {
  const settings = db.prepare('SELECT * FROM store_settings').all();
  res.json({ success: true, settings });
});

// Store settings: Update
router.put('/settings', (req: Request, res: Response): void => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    res.status(400).json({ success: false, message: 'Settings object is required' });
    return;
  }

  const updateStmt = db.prepare('INSERT OR REPLACE INTO store_settings (key, value, description) VALUES (?, ?, ?)');

  for (const [key, val] of Object.entries(settings)) {
    const existing = db.prepare('SELECT description FROM store_settings WHERE key = ?').get(key) as any;
    const desc = existing ? existing.description : '';
    updateStmt.run(key, String(val), desc);
  }

  // If default_poster_price is updated, optionally update all standard posters
  if (req.body.apply_to_all_posters && settings.default_poster_price) {
    const newPrice = parseInt(settings.default_poster_price, 10);
    if (!isNaN(newPrice) && newPrice > 0) {
      db.prepare('UPDATE posters SET price = ?').run(newPrice);
    }
  }

  res.json({ success: true, message: 'Store settings updated successfully' });
});

export default router;
