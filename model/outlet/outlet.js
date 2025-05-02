const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const outletSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: String,
  isActive: { type: Boolean, default: true },
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Outlet', outletSchema);
