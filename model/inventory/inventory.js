const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventoryItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { 
      type: String, 
      enum: ['Sabun', 'Plastik', 'Pewangi', 'Deterjen', 'Lainnya'], 
      default: 'Lainnya' 
    },
    stock: { type: Number, required: true, default: 0 },
    minStock: { type: Number, default: 0 },
    satuan: { type: String, default: 'pcs' },
    pricePerUnit: { type: Number, default: 0 },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: { type: Boolean, default: true }
  }, {
    timestamps: true,
    versionKey: false
  });

  
  module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
  