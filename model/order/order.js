const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderCode: { type: String, unique: true, required: true, trim: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  customerName: { type: String, default: null, trim: true },
  customerPhone: { type: String, default: null, trim: true },
  customerEmail : {type : String , default : null , trim : true} ,
  outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },

  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerKg: { type: Number, required: false, min: 0 },
    pricePerItem: { type: Number, required: false, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
  }],

  total: { type: Number, required: true, min: 0 },

  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },

  paymentType: {
    type: String,
    enum: ['cash', 'bank_transfer', 'ewallet'],
    default: 'cash'
  },

  serviceType: {
    type: String,
    enum: ['regular', 'express', 'super_express'],
    default: 'regular'
  },

  note: { type: String, default: null },
  pickupDate: Date,
  completedAt: Date,

  discountCode: { type: String, default: null, trim: true },
  discountAmount: { type: Number, default: 0, min: 0 },

  // TTL Field
  expireAt: {
    type: Date,
    default: null
  }

}, { timestamps: true, versionKey: false });



module.exports = mongoose.model('Order', orderSchema);
