const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // role: owner
        required: true
    },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const operationalReportSchema = new Schema({
    outletId: {
        type: Schema.Types.ObjectId,
        ref: 'Outlet',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // role: cashier
        required: true
    },
    category: {
        type: String,
        enum: ['Mesin Rusak', 'Kebersihan', 'Air Mati', 'Listrik', 'Lainnya'], // still in Indonesian
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
    photo: {
        type: Schema.Types.ObjectId,
        ref: 'File' ,
        default : null
    },
    feedback: {
        type: [feedbackSchema],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('OperationalReport', operationalReportSchema);
