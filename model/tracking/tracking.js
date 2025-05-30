const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trackingSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    logs: [
        {
            status: {
                type: String,
                enum: [
                    'Order Created',
                    'Order Pending',
                    'Payment Received',    
                    'In Progress',
                    'Completed',
                    'Taken',
                    'Order Canceled'
                ],
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

module.exports = mongoose.model('Tracking', trackingSchema);
