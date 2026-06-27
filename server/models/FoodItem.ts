import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodItem extends Document {
  name: string;
  description?: string;
  price: number;
  category: 'Pizza' | 'Burger' | 'Cake' | 'Drink' | 'Other';
  image?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const foodItemSchema = new Schema<IFoodItem>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['Pizza', 'Burger', 'Cake', 'Drink', 'Other'],
    required: true
  },
  image: {
    type: String,
    trim: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const FoodItem = mongoose.model<IFoodItem>('FoodItem', foodItemSchema);
export default FoodItem;
