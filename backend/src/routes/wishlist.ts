import express from 'express';
import type { Request, Response } from 'express';
const Router = express.Router;
import { db } from '../db.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

// Get wishlist items
router.get('/', authenticate, (req: Request, res: Response): void => {
  const items = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, w.created_at as wishlisted_at
    FROM wishlists w
    JOIN posters p ON w.poster_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).all(req.user!.id);

  res.json({ success: true, items });
});

// Toggle wishlist item
router.post('/toggle', authenticate, (req: Request, res: Response): void => {
  const { poster_id } = req.body;
  if (!poster_id) {
    res.status(400).json({ success: false, message: 'poster_id is required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND poster_id = ?').get(req.user!.id, poster_id);

  if (existing) {
    db.prepare('DELETE FROM wishlists WHERE user_id = ? AND poster_id = ?').run(req.user!.id, poster_id);
    res.json({ success: true, wishlisted: false, message: 'Removed from wishlist' });
  } else {
    const id = `wl_${Date.now()}`;
    db.prepare('INSERT INTO wishlists (id, user_id, poster_id) VALUES (?, ?, ?)').run(id, req.user!.id, poster_id);
    res.json({ success: true, wishlisted: true, message: 'Added to wishlist' });
  }
});

export default router;
