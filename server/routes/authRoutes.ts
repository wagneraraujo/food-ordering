import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: {
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name must be at most 50 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().optional().nullable()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Public routes
router.post('/register', authRateLimiter, validateBody(registerSchema), register as any);
router.post('/login', authRateLimiter, validateBody(loginSchema), login as any);

// Protected routes
router.get('/me', auth, getMe as any);

export default router;
