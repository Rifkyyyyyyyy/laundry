const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  paymentType: {
    type: String,
    enum: ['cash', 'bank_transfer', 'ewallet'],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'expired', 'cancelled'],
    default: 'pending'
  },

  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },

  paidAt: {
    type: Date,
    default: null
  },

  transactionId: {
    type: String,
    default: null // Midtrans only
  },

  metadata: {
    type: Schema.Types.Mixed, // Bisa simpan data Midtrans, keterangan tambahan, dsb
    default: {}
  },

  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Admin/kasir yang input pembayaran
    default: null
  }

}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Payment', paymentSchema);
