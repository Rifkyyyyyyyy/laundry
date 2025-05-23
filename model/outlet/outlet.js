const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const outletSchema = new Schema({
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    long: { type: Number, required: true }
  },
  phone: String,
  isActive: { type: Boolean, default: true },
  openingDays: {
    type: [String],
    required: true
  },
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  photo: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: false
  }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Outlet', outletSchema);
