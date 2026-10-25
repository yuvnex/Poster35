import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { initDatabase, db } from './db.ts';
import authRoutes from './routes/auth.ts';
import categoriesRoutes from './routes/categories.ts';
import postersRoutes from './routes/posters.ts';
import cartRoutes from './routes/cart.ts';
import ordersRoutes from './routes/orders.ts';
import paymentsRoutes from './routes/payments.ts';
import wishlistRoutes from './routes/wishlist.ts';
import adminRoutes from './routes/admin.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

// Initialize DB schema & defaults
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    store: 'Poster35',
    default_price: '₹35',
    timestamp: new Date().toISOString()
  });
});

// Public store configuration
app.get('/api/config', (_req: Request, res: Response) => {
  const settingsRows = db.prepare('SELECT key, value FROM store_settings').all() as { key: string; value: string }[];
  const config = settingsRows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  res.json({
    success: true,
    config: {
      default_poster_price: parseInt(config.default_poster_price || '35', 10),
      currency: config.currency || 'INR',
      currency_symbol: '₹',
      delivery_fee: parseInt(config.delivery_fee || '49', 10),
      free_delivery_threshold: parseInt(config.free_delivery_threshold || '175', 10),
      cod_enabled: config.cod_enabled === 'true',
      digital_fulfilment_enabled: config.digital_fulfilment_enabled === 'true',
      store_name: config.store_name || 'Poster35',
      store_headline: config.store_headline || 'Your Favourite Posters. Just ₹35.',
      store_subtext: config.store_subtext || 'Movies, legends, football icons and more. Find your vibe.',
      store_phone: config.store_phone || '+91 98765 43210',
      store_email: config.store_email || 'orders@poster35.com'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/posters', postersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Serve frontend production build when dist exists (Render / Unified Hosting)
const frontendDistPath = path.join(workspaceRoot, 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  POSTER35 Backend Server Active`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/api/health`);
    console.log(`  Pricing: Fixed ₹35 per poster`);
    console.log(`===============================================`);
  });
}

export default app;
