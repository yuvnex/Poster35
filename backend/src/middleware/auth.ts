import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'poster35_super_secret_jwt_key_2026';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'USER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    // Check if user still exists in DB
    const user = db.prepare('SELECT id, email, full_name, role FROM users WHERE id = ?').get(decoded.id) as AuthUser | undefined;
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      const user = db.prepare('SELECT id, email, full_name, role FROM users WHERE id = ?').get(decoded.id) as AuthUser | undefined;
      if (user) {
        req.user = user;
      }
    } catch {
      // ignore optional auth errors
    }
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Administrator access required' });
    return;
  }
  next();
}
