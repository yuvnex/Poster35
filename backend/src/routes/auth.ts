import express from 'express';
import type { Request, Response } from 'express';
const Router = express.Router;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.ts';
import { authenticate, JWT_SECRET } from '../middleware/auth.ts';
import type { AuthUser } from '../middleware/auth.ts';

const router = Router();

// Register new user
router.post('/register', (req: Request, res: Response): void => {
  const { email, password, full_name, phone } = req.body;

  if (!email || !password || !full_name) {
    res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with this email already exists' });
    return;
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, phone, role)
    VALUES (?, ?, ?, ?, ?, 'USER')
  `).run(userId, email.toLowerCase().trim(), passwordHash, full_name.trim(), phone?.trim() || null);

  const userPayload: AuthUser = {
    id: userId,
    email: email.toLowerCase().trim(),
    full_name: full_name.trim(),
    role: 'USER'
  };

  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ success: true, token, user: userPayload });
});

// Direct Customer Login (No sign-up / No password required)
router.post('/direct-login', (req: Request, res: Response): void => {
  const { name, phone, email } = req.body;
  const customerName = name?.trim() || 'Valued Customer';
  const customerEmail = email?.toLowerCase().trim() || `customer_${Date.now().toString(36)}@poster35.com`;
  const customerPhone = phone?.trim() || null;

  // Find existing by email or phone, or create new seamless user
  let user = db.prepare('SELECT id, email, full_name, phone, role FROM users WHERE email = ?').get(customerEmail) as any;
  if (!user && customerPhone) {
    user = db.prepare('SELECT id, email, full_name, phone, role FROM users WHERE phone = ?').get(customerPhone) as any;
  }

  if (!user) {
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const randomHash = bcrypt.hashSync(Math.random().toString(36), 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role)
      VALUES (?, ?, ?, ?, ?, 'USER')
    `).run(userId, customerEmail, randomHash, customerName, customerPhone);

    user = {
      id: userId,
      email: customerEmail,
      full_name: customerName,
      role: 'USER'
    };
  } else if (name?.trim() && user.full_name !== customerName) {
    db.prepare('UPDATE users SET full_name = ? WHERE id = ?').run(customerName, user.id);
    user.full_name = customerName;
  }

  const userPayload: AuthUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role
  };

  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });
  res.json({ success: true, token, user: userPayload });
});

// Login
router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = db.prepare(`
    SELECT id, email, password_hash, full_name, phone, role 
    FROM users 
    WHERE email = ?
  `).get(email.toLowerCase().trim()) as {
    id: string;
    email: string;
    password_hash: string;
    full_name: string;
    phone: string | null;
    role: 'USER' | 'ADMIN';
  } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const userPayload: AuthUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role
  };

  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: userPayload });
});

// Current user profile
router.get('/me', authenticate, (req: Request, res: Response): void => {
  const user = db.prepare(`
    SELECT id, email, full_name, phone, role, created_at 
    FROM users 
    WHERE id = ?
  `).get(req.user!.id);

  res.json({ success: true, user });
});

// Update profile
router.put('/profile', authenticate, (req: Request, res: Response): void => {
  const { full_name, phone } = req.body;
  if (!full_name) {
    res.status(400).json({ success: false, message: 'Full name is required' });
    return;
  }

  db.prepare('UPDATE users SET full_name = ?, phone = ? WHERE id = ?').run(
    full_name.trim(),
    phone?.trim() || null,
    req.user!.id
  );

  res.json({ success: true, message: 'Profile updated successfully' });
});

// Addresses
router.get('/addresses', authenticate, (req: Request, res: Response): void => {
  const addresses = db.prepare(`
    SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC
  `).all(req.user!.id);

  res.json({ success: true, addresses });
});

router.post('/addresses', authenticate, (req: Request, res: Response): void => {
  const { full_name, phone, address_line, city, state, pincode, is_default } = req.body;
  if (!full_name || !phone || !address_line || !city || !state || !pincode) {
    res.status(400).json({ success: false, message: 'All address fields are required' });
    return;
  }

  const addressId = `addr_${Date.now()}`;
  if (is_default) {
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user!.id);
  }

  db.prepare(`
    INSERT INTO user_addresses (id, user_id, full_name, phone, address_line, city, state, pincode, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(addressId, req.user!.id, full_name, phone, address_line, city, state, pincode, is_default ? 1 : 0);

  res.status(201).json({ success: true, addressId });
});

router.delete('/addresses/:id', authenticate, (req: Request, res: Response): void => {
  db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  res.json({ success: true, message: 'Address removed' });
});

export default router;
