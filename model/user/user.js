const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ['owner', 'kasir', 'customer'], required: true },
  password: { type: String, required: true },
  phone: { type: String, required: false, default: '' },
  address: {
    address: { type: String, default: null },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  outletId: {
    type: Schema.Types.ObjectId,
    ref: 'Outlet',
    required: function () { return this.role === 'kasir'; }
  },
  photo: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: false,
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('User', userSchema);
