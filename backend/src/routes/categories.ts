import express from 'express';
import type { Request, Response } from 'express';
const Router = express.Router;
import { db } from '../db.ts';

const router = Router();

// List all categories with product count
router.get('/', (req: Request, res: Response): void => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as poster_count
    FROM categories c
    LEFT JOIN posters p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.name ASC
  `).all();

  res.json({ success: true, categories });
});

// Category by slug or ID with posters
router.get('/:slug', (req: Request, res: Response): void => {
  const category = db.prepare(`
    SELECT * FROM categories WHERE slug = ? OR id = ?
  `).get(req.params.slug, req.params.slug) as any;

  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }

  const posters = db.prepare(`
    SELECT * FROM posters WHERE category_id = ? ORDER BY is_featured DESC, created_at DESC
  `).all(category.id);

  res.json({ success: true, category, posters, count: posters.length });
});

export default router;
