const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discountSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountAmount: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  applicableProductIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  outlet: {
    type: Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true
  },
  maxUsage: { type: Number, default: null },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });


module.exports = mongoose.model('Discount', discountSchema);