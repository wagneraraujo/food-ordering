import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

// Helper to compute uppercase MD5 hash
const md5 = (string: string): string => {
  return crypto.createHash('md5').update(string).digest('hex').toUpperCase();
};

// Safe helper to decode base64 encoded merchant secret keys
const getDecodedSecret = (secret: string): string => {
  try {
    // If it is a base64 encoded string, decode it.
    // PayHere secrets are alphanumeric strings, which when base64 encoded have a valid format.
    const decoded = Buffer.from(secret, 'base64').toString('ascii');
    if (/^[a-zA-Z0-9]+$/.test(decoded)) {
      return decoded;
    }
  } catch (e) {
    // Return original if decoding fails
  }
  return secret;
};

// Generate PayHere Checkout parameters (Customer only)
export const initPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { orderId } = req.body; // orderId is the database order _id
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check ownership
    if (order.customer.toString() !== (req.user as any).id) {
      return res.status(403).json({ message: 'Access denied: You do not own this order' });
    }

    const user = await User.findById((req.user as any).id);
    if (!user) {
      return res.status(404).json({ message: 'Customer account not found' });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID || '1230000';
    const merchantSecret = getDecodedSecret(process.env.PAYHERE_MERCHANT_SECRET || 'sandbox_merchant_secret_key_123');
    const currency = 'USD';
    const amountFormatted = order.total.toFixed(2);

    // Calculate MD5 hash for PayHere Checkout form
    // Hash = MD5(MerchantID + OrderID + Amount + Currency + MD5(MerchantSecret))
    const hashedSecret = md5(merchantSecret).toUpperCase();
    const hashInput = merchantId + order.orderId + amountFormatted + currency + hashedSecret;
    const checkoutHash = md5(hashInput).toUpperCase();

    // Construct comma-separated item names
    const itemsList = order.items.map(i => i.name).join(', ');

    // Split user name to first and last name
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || 'N/A';
    const lastName = nameParts.slice(1).join(' ') || 'N/A';

    // Construct public backend notify URL dynamically (or from env if present)
    const host = req.get('host');
    const protocol = req.protocol;
    const notifyUrl = process.env.PAYHERE_NOTIFY_URL || `${protocol}://${host}/api/payments/notify`;

    res.json({
      merchant_id: merchantId,
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/confirmation?order_id=${order.orderId}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/cart`,
      notify_url: notifyUrl,
      order_id: order.orderId,
      items: itemsList || 'Food Order',
      amount: amountFormatted,
      currency: currency,
      hash: checkoutHash,
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      phone: user.phone || '0000000000',
      address: 'N/A',
      city: 'N/A',
      country: 'Sri Lanka'
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error initiating payment', error: error.message });
  }
};

// Handle server-to-server webhook success/fail notification (Public Webhook)
export const handlePaymentNotification = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method
    } = req.body;

    if (!merchant_id || !order_id || !payment_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
      return res.status(400).json({ message: 'Missing webhook payload parameters' });
    }

    const merchantSecret = getDecodedSecret(process.env.PAYHERE_MERCHANT_SECRET || 'sandbox_merchant_secret_key_123');

    // Recalculate signature:
    // MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret))
    const hashedSecret = md5(merchantSecret).toUpperCase();
    const localSigInput = merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret;
    const localSig = md5(localSigInput).toUpperCase();

    if (localSig !== md5sig.toUpperCase()) {
      console.warn(`Payment verification failed. Local signature: ${localSig}, Received: ${md5sig}`);
      return res.status(400).json({ message: 'Invalid payment signature hash' });
    }

    // Find the corresponding order
    const order = await Order.findOne({ orderId: order_id });
    if (!order) {
      return res.status(404).json({ message: `Order not found with order_id: ${order_id}` });
    }

    // Check status code: 2 = Success, others are failed/pending
    // Update order status only if currently Pending
    if (status_code === '2') {
      if (order.status === 'Pending') {
        order.status = 'Preparing';
        order.paymentStatus = 'Paid';
      }
    } else {
      order.status = 'Cancelled';
      order.paymentStatus = 'Failed';
    }
    await order.save();

    // Log the transaction in the Payment collection
    const paymentRecord = new Payment({
      order: order._id,
      paymentId: payment_id,
      status: status_code,
      amount: parseFloat(payhere_amount),
      currency: payhere_currency,
      method: method || 'PayHere Gateway',
      payhereRawData: req.body
    });
    await paymentRecord.save();

    res.status(200).send('OK');
  } catch (error: any) {
    res.status(500).json({ message: 'Server error handling payment notification', error: error.message });
  }
};
