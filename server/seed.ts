import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import FoodItem from './models/FoodItem.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/food-ordering';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await FoodItem.deleteMany({});
    console.log('Cleared existing Users and FoodItems.');

    // Seed Admin User
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Master Admin',
      email: 'admin@food.com',
      password: adminPasswordHash,
      phone: '+94770000000',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user seeded: admin@food.com / admin123');

    // Seed a default Customer User
    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    const customerUser = new User({
      name: 'Jane Doe',
      email: 'customer@food.com',
      password: customerPasswordHash,
      phone: '+94771234567',
      role: 'customer'
    });
    await customerUser.save();
    console.log('Customer user seeded: customer@food.com / customer123');

    // Seed Food Items
    const foodItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce and mozzarella',
        price: 12.99,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Cheeseburger',
        description: 'Beef burger with cheese and lettuce',
        price: 8.99,
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Chocolate Cake',
        description: 'Fudgy double chocolate cake slice',
        price: 4.99,
        category: 'Cake',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Coca Cola',
        description: 'Chilled 330ml can',
        price: 1.99,
        category: 'Drink',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
        available: true
      }
    ];

    await FoodItem.insertMany(foodItems);
    console.log('Default food items seeded successfully.');

    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
