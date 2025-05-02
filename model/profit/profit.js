const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profitSchema = new Schema({
  date: { type: Date, required: true },
  totalIncome: { type: Number, required: true },
  totalCost: { type: Number, default: 0 },
  profit: { type: Number, required: true },
  outletId: {
    type: Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Profit', profitSchema);
