import { Request, Response } from 'express';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';

// Create a new order (Customer only)
export const createOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    let calculatedTotal = 0;
    const snapshottedItems = [];

    for (const itemObj of items) {
      const { item: itemId, quantity } = itemObj;
      if (!itemId || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid item id or quantity' });
      }

      const foodItem = await FoodItem.findById(itemId);
      if (!foodItem) {
        return res.status(404).json({ message: `Food item not found: ${itemId}` });
      }

      if (!foodItem.available) {
        return res.status(400).json({ message: `Food item is currently unavailable: ${foodItem.name}` });
      }

      const itemPrice = foodItem.price;
      const subtotal = itemPrice * quantity;
      calculatedTotal += subtotal;

      snapshottedItems.push({
        item: foodItem._id,
        name: foodItem.name,
        price: itemPrice,
        quantity: quantity
      });
    }

    const uniqueOrderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = new Order({
      customer: (req.user as any).id,
      items: snapshottedItems,
      total: calculatedTotal,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      orderId: uniqueOrderId
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error creating order', error: error.message });
  }
};

// Get order history for the logged-in customer (Customer only)
export const getMyOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const orders = await Order.find({ customer: (req.user as any).id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving order history', error: error.message });
  }
};

// Get all orders in the system (Admin only)
export const getAllOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving all orders', error: error.message });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json({
      _id: updatedOrder._id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating order status', error: error.message });
  }
};

// Retrieve a single order by custom orderId (Customer/Admin ownership checked)
export const getOrderByOrderId = async (req: Request, res: Response): Promise<any> => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate('customer', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership or check if admin
    const customerObj = order.customer as any;
    const customerId = customerObj._id ? customerObj._id.toString() : customerObj.toString();
    if (customerId !== (req.user as any).id && (req.user as any).role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Unauthorized view' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving order details', error: error.message });
  }
};
