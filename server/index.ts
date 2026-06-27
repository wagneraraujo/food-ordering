import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Import middlewares
import errorHandler from './middleware/error.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/items', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Food Ordering API is running...');
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/food-ordering';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
