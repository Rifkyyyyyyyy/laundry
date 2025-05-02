const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  estimation: { type: String, required: true },
  description: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  outletId: {
    type: Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
