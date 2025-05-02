const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  outletId: {
    type: Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true
  },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    pricePerKg: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'taken'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  note: String,
  pickupDate: Date,
  completedAt: Date,
  discountId: {
    type: Schema.Types.ObjectId,
    ref: 'Discount'
  },
  discountCode: { type: String }, // Store the applied discount code
  discountAmount: { type: Number, default: 0 }, // Discount amount applied
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
