import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  order: Types.ObjectId;
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  method?: string;
  payhereRawData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  method: {
    type: String
  },
  payhereRawData: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;
