import { Request, Response } from 'express';
import FoodItem from '../models/FoodItem.js';

// Get all food items (or only available ones for customers)
export const getItems = async (req: Request, res: Response): Promise<any> => {
  try {
    const filter: any = {};
    // If not admin, only show available items
    if (!req.user || req.user.role !== 'admin') {
      filter.available = true;
    }
    const items = await FoodItem.find(filter);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving food items', error: error.message });
  }
};

// Create a new food item (Admin only)
export const createItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, price, category, image } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const newItem = new FoodItem({
      name,
      description,
      price,
      category,
      image,
      available: true
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error creating food item', error: error.message });
  }
};

// Update an existing food item (Admin only)
export const updateItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, price, category, image, available } = req.body;
    const item = await FoodItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (category !== undefined) item.category = category;
    if (image !== undefined) item.image = image;
    if (available !== undefined) item.available = available;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating food item', error: error.message });
  }
};

// Delete a food item (Admin only)
export const deleteItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    await FoodItem.deleteOne({ _id: req.params.id });
    res.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting food item', error: error.message });
  }
};
