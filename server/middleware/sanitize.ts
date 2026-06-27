import { Request, Response, NextFunction } from 'express';
import sanitize from 'mongo-sanitize';

export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  next();
};
