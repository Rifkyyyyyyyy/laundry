const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    outletId: {
        type: Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    membershipLevel: {
        type: String,
        enum: ['silver', 'gold', 'platinum'],
        default: 'silver'
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    expiredDate: {
        type: Date,
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    memberNumber: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: false, versionKey: false });

module.exports = mongoose.model('Member', memberSchema);
