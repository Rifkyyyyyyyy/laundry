const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../user/user');

const paymentSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'qris', 'cash'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: function () {
      return this.paymentType === 'online';
    }
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function (userId) {
        if (!userId || this.paymentType !== 'offline') return true;
        const user = await User.findById(userId);
        return user && user.role === 'kasir';
      },
      message: 'updatedBy hanya boleh diisi oleh user dengan role kasir'
    },
    required: function () {
      return this.paymentType === 'offline';
    }
  },
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
