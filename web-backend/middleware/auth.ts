import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare var process: any;
const JWT_SECRET = (process.env.JWT_SECRET || 'default_secret_key_change_me_in_production') as string;

export type AuthRequest = Request & {
  user?: {
    userId: string;
    role: string;
    ad?: string;
    soyad?: string;
  };
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = (req as any).headers?.authorization || (req as any).header?.('Authorization');
  let token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;

  // Browser'dan direkt linkle test etmek için query parameter desteği ekleyelim
  if (!token && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; ad?: string; soyad?: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Yetkisiz işlem (Admin gerekir)' });
  }
};
