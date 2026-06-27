# Data Model: TypeScript Types & Interfaces

This document outlines the strong type signatures for the MongoDB schemas mapped through Mongoose, ensuring type safety and compile-time data integrity checks across both client and server applications.

## 1. User Entity

### Type Signature (`IUser`)
```typescript
import { Document } from 'mongoose';

export type UserRole = 'customer' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional since it might be omitted in JSON responses
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. FoodItem Entity

### Type Signature (`IFoodItem`)
```typescript
import { Document } from 'mongoose';

export interface IFoodItem extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Order Entity

### Type Signature (`IOrder`)
```typescript
import { Document, Types } from 'mongoose';

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Paid';

export interface IOrderItem {
  foodItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderId: string; // Unique human-readable string ID
  customer: Types.ObjectId | IUser;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### State Transitions
Only valid order status state transitions are allowed:
- `Pending` -> `Preparing` (Only triggered via successful payment signature webhook notification)
- `Preparing` -> `Ready` (Admin only)
- `Ready` -> `Delivered` (Admin only)
- `Pending` -> `Cancelled` or `Preparing` -> `Cancelled` (Admin only)

---

## 4. Payment Entity

### Type Signature (`IPayment`)
```typescript
import { Document, Types } from 'mongoose';

export interface IPayment extends Document {
  order: Types.ObjectId | IOrder;
  transactionId: string;
  statusCode: number;
  amount: number;
  currency: string;
  rawPayload: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```
