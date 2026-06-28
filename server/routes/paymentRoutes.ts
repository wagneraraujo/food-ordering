import express from 'express';
import { initPayment, handlePaymentNotification, simulatePaymentNotification } from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Customer only - initiate checkout parameter generation
router.post('/init', auth, initPayment as any);

// Public webhook - server-to-server callback from PayHere
router.post('/notify', handlePaymentNotification as any);

// Customer simulation endpoint for local development
router.post('/simulate', auth, simulatePaymentNotification as any);

export default router;
