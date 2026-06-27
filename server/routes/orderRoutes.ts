import express from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrderByOrderId } from '../controllers/orderController.js';
import auth from '../middleware/auth.js';
import adminGuard from '../middleware/adminGuard.js';

const router = express.Router();

// Customer routes
router.post('/', auth, createOrder as any);
router.get('/my-orders', auth, getMyOrders as any);
router.get('/:orderId', auth, getOrderByOrderId as any);

// Admin routes
router.get('/', auth, adminGuard, getAllOrders as any);
router.put('/:id/status', auth, adminGuard, updateOrderStatus as any);

export default router;
