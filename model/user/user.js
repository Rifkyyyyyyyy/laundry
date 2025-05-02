const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ['owner', 'kasir', 'customer'], required: true },
  password: {
    required: true,
    type: String
  },
  outletId: {
    type: Schema.Types.ObjectId,
    ref: 'Outlet',
    required: function () { return this.role === 'kasir'; }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
