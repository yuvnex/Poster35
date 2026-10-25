import express from 'express';
import type { Request, Response } from 'express';
const Router = express.Router;
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from '../db.ts';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..', '..');

// Map slug to actual folder name in workspace
const SLUG_TO_FOLDER: Record<string, string> = {
  cr7: 'CR7',
  dhoni: 'Dhoni',
  'english-movies': 'English Movies',
  messi: 'Messi',
  'music-poster': 'Music Poster',
  neymar: 'Neymar',
  'tamil-movies': 'Tamil Movies',
  vijay: 'Vijay',
  'virat-kohli': 'Virat Kohli',
  ajith: 'Ajith',
  anime: 'Anime'
};

// Image serving endpoint
router.get('/image/:category/:filename', (req: Request, res: Response): void => {
  const categorySlug = req.params.category.toLowerCase();
  let filename = req.params.filename;
  try {
    filename = decodeURIComponent(req.params.filename);
  } catch {
    filename = req.params.filename;
  }

  // Security check: prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).send('Invalid filename');
    return;
  }

  const folderName = SLUG_TO_FOLDER[categorySlug] || categorySlug;
  const filePath = path.join(workspaceRoot, folderName, filename);

  if (fs.existsSync(filePath)) {
    // Set caching headers for high performance
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.sendFile(filePath);
    return;
  }

  // Fallback 1: Case-insensitive or trimmed match in category folder
  const categoryDir = path.join(workspaceRoot, folderName);
  if (fs.existsSync(categoryDir) && fs.statSync(categoryDir).isDirectory()) {
    try {
      const files = fs.readdirSync(categoryDir);
      const match = files.find(f => f.toLowerCase() === filename.toLowerCase());
      if (match) {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        res.sendFile(path.join(categoryDir, match));
        return;
      }
      const cleanTarget = filename.replace(/\s+/g, ' ').trim().toLowerCase();
      const matchFuzzy = files.find(f => f.replace(/\s+/g, ' ').trim().toLowerCase() === cleanTarget);
      if (matchFuzzy) {
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        res.sendFile(path.join(categoryDir, matchFuzzy));
        return;
      }
    } catch {}
  }

  // Fallback 2: Check in uploads folder for admin-uploaded images
  const uploadPath = path.join(workspaceRoot, 'backend', 'uploads', filename);
  if (fs.existsSync(uploadPath)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(uploadPath);
    return;
  }

  // Fallback SVG placeholder if file is genuinely missing (never cache placeholders)
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="#13151b">
      <rect width="400" height="600" fill="#13151b"/>
      <rect x="20" y="20" width="360" height="560" rx="8" fill="#1e222d" stroke="#374151" stroke-width="2"/>
      <text x="200" y="280" font-family="sans-serif" font-size="22" font-weight="bold" fill="#f3f4f6" text-anchor="middle">Poster35</text>
      <text x="200" y="320" font-family="sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">Fixed ₹35 Poster</text>
    </svg>
  `);
});

// List posters with search, filter, sort, and pagination
router.get('/', (req: Request, res: Response): void => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 24));
  const offset = (page - 1) * limit;

  const category = (req.query.category as string)?.trim();
  const search = (req.query.search as string)?.trim();
  const featured = req.query.featured === '1' || req.query.featured === 'true';
  const trending = req.query.trending === '1' || req.query.trending === 'true';
  const sort = (req.query.sort as string) || 'popular';

  let whereClauses: string[] = ['p.in_stock = 1'];
  let params: any[] = [];

  if (category && category !== 'all') {
    whereClauses.push('(c.slug = ? OR c.id = ?)');
    params.push(category, category);
  }

  if (search) {
    whereClauses.push('(p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ? OR c.name LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (featured) {
    whereClauses.push('p.is_featured = 1');
  }

  if (trending) {
    whereClauses.push('p.is_trending = 1');
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  let orderSql = 'ORDER BY p.is_trending DESC, p.created_at DESC';
  switch (sort) {
    case 'newest':
      orderSql = 'ORDER BY p.created_at DESC';
      break;
    case 'alpha_asc':
      orderSql = 'ORDER BY p.title ASC';
      break;
    case 'alpha_desc':
      orderSql = 'ORDER BY p.title DESC';
      break;
    case 'price_asc':
      orderSql = 'ORDER BY p.price ASC, p.title ASC';
      break;
    case 'price_desc':
      orderSql = 'ORDER BY p.price DESC, p.title ASC';
      break;
    case 'popular':
    default:
      orderSql = 'ORDER BY p.is_trending DESC, p.is_featured DESC, p.created_at DESC';
      break;
  }

  const countQuery = `
    SELECT COUNT(p.id) as total
    FROM posters p
    JOIN categories c ON p.category_id = c.id
    ${whereSql}
  `;
  const countResult = db.prepare(countQuery).get(...params) as { total: number };
  const total = countResult ? countResult.total : 0;

  const listQuery = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM posters p
    JOIN categories c ON p.category_id = c.id
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?
  `;

  const posters = db.prepare(listQuery).all(...params, limit, offset);

  res.json({
    success: true,
    posters,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Single poster details
router.get('/:idOrSlug', (req: Request, res: Response): void => {
  const param = req.params.idOrSlug;
  const poster = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM posters p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? OR p.slug = ?
  `).get(param, param) as any;

  if (!poster) {
    res.status(404).json({ success: false, message: 'Poster not found' });
    return;
  }

  // Fetch 4 related posters in same category
  const related = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM posters p
    JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ? AND p.id != ?
    ORDER BY p.is_featured DESC, RANDOM()
    LIMIT 4
  `).all(poster.category_id, poster.id);

  res.json({ success: true, poster, related });
});

export default router;
