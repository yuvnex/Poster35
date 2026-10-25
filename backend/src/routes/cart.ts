import express from 'express';
import type { Request, Response } from 'express';
const Router = express.Router;
import { calculateCartPricing } from '../services/pricing.ts';
import { optionalAuthenticate } from '../middleware/auth.ts';
import { db } from '../db.ts';

const router = Router();

// Recalculate price server-side
router.post('/calculate', (req: Request, res: Response): void => {
  const { items, fulfilment_type } = req.body;

  if (!Array.isArray(items)) {
    res.status(400).json({ success: false, message: 'Items array is required' });
    return;
  }

  const breakdown = calculateCartPricing(items, fulfilment_type === 'DIGITAL' ? 'DIGITAL' : 'PHYSICAL');
  res.json({ success: true, ...breakdown });
});

// Sync / get server cart
router.get('/', optionalAuthenticate, (req: Request, res: Response): void => {
  const userId = req.user?.id;
  const sessionId = (req.query.session_id as string)?.trim();

  if (!userId && !sessionId) {
    res.json({ success: true, items: [] });
    return;
  }

  const cart = db.prepare(`
    SELECT id FROM carts WHERE ${userId ? 'user_id = ?' : 'session_id = ?'}
  `).get(userId || sessionId) as { id: string } | undefined;

  if (!cart) {
    res.json({ success: true, items: [] });
    return;
  }

  const cartItems = db.prepare(`
    SELECT ci.id, ci.poster_id, ci.quantity, p.title, p.price, p.image_url, p.in_stock,
           (ci.quantity * p.price) as line_total, c.name as category_name
    FROM cart_items ci
    JOIN posters p ON ci.poster_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE ci.cart_id = ?
    ORDER BY ci.created_at ASC
  `).all(cart.id);

  res.json({ success: true, items: cartItems });
});

export default router;
