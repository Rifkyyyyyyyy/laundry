const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ['kg', 'item'], required: true },
  description: { type: String, default: '' },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },
  photo: { type: Schema.Types.ObjectId, ref: 'File', required: true }
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('Product', productSchema);
