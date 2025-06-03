const Tracking = require('../../model/tracking/tracking');
const Order = require('../../model/order/order');
const ApiError = require('../../utils/apiError');
const mongoose = require('mongoose');
const { getPagination } = require('../../utils/func');
const { StatusCodes } = require('http-status-codes');

const VALID_STATUSES = [
    'Order Pending',
    'Payment Received',
    'In Progress',
    'Completed',
    'Taken',
    'Order Canceled'
];

const getTrackingByOrderId = async (orderId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'ID order tidak valid.'
            );
        }

        const tracking = await Tracking.findOne({ orderId }).populate('orderId');
        if (!tracking) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Tracking untuk order ini tidak ditemukan.'
            );
        }

        return tracking.logs;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Terjadi kesalahan saat mengambil ringkasan tracking hari ini.'
        );
    }
};

const updateTrackingById = async (trackingId, status) => {
    try {
        if (!VALID_STATUSES.includes(status)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Status tidak valid. Status yang diperbolehkan: ${VALID_STATUSES.join(', ')}.`
            );
        }

        if (!mongoose.Types.ObjectId.isValid(trackingId)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'ID tracking tidak valid.'
            );
        }

        const result = await Tracking.updateOne(
            { _id: trackingId },
            {
                $push: {
                    logs: {
                        status,
                        timestamp: new Date()
                    }
                },
                $set: {
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Tracking dengan ID tersebut tidak ditemukan.'
            );
        }

        return result.modifiedCount;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Terjadi kesalahan saat memperbarui tracking.'
        );
    }
};


const getTrackingByOutletId = async (outletId, page = 1, limit = 10) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(outletId)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'ID outlet tidak valid.'
            );
        }

        const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

        const orders = await Order.find({ outletId }).select('_id');
        const orderIds = orders.map(order => order._id);

        if (orderIds.length === 0) {
            return {
                tracking: [],
                pagination: {
                    ...metadata,
                    totalCount: 0,
                    totalPages: 0,
                }
            };
        }

        const totalCount = await Tracking.countDocuments({ orderId: { $in: orderIds } });

        const tracking = await Tracking.find({ orderId: { $in: orderIds } })
            .populate('orderId')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(pageLimit);

        return {
            tracking,
            pagination: {
                ...metadata,
                totalCount,
                totalPages: Math.ceil(totalCount / pageLimit),
            },
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Terjadi kesalahan saat mengambil ringkasan tracking hari ini.'
        );
    }
};

module.exports = {
    getTrackingByOrderId,
    updateTrackingById,
    getTrackingByOutletId,
};
