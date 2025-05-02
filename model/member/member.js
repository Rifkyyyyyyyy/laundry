const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
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
    points: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
