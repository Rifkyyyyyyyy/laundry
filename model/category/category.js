const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  photo: {
    type: Schema.Types.ObjectId,
    ref: 'File', // Sesuaikan dengan model file
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
