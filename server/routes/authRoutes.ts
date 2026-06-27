import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register as any);
router.post('/login', login as any);

// Protected routes
router.get('/me', auth, getMe as any);

export default router;
