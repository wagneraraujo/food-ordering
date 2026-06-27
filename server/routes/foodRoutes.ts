import express from 'express';
import { getItems, createItem, updateItem, deleteItem } from '../controllers/foodController.js';
import auth from '../middleware/auth.js';
import adminGuard from '../middleware/adminGuard.js';

const router = express.Router();

// GET /api/items - public menu browsing
router.get('/', getItems as any);

// POST /api/items - admin item creation
router.post('/', auth, adminGuard, createItem as any);

// PUT /api/items/:id - admin item update
router.put('/:id', auth, adminGuard, updateItem as any);

// DELETE /api/items/:id - admin item delete
router.delete('/:id', auth, adminGuard, deleteItem as any);

export default router;
