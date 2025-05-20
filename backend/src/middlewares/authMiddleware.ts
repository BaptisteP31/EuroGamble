import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
  } else {
    const token = authHeader.split(' ')[1];

    try {
      const payload = verifyToken(token);
      (req as any).user = payload;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}
