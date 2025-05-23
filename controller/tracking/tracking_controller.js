const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
    getTrackingByOrderId,
    getTrackingByOutletId,
    updateTrackingByOutlet
} = require('../../service/tracking/tracking_service');

// [GET] /tracking/order/:orderId
const getTrackingByOrder = catchAsync(async (req, res) => {
    const { orderId } = req.params;

    const tracking = await getTrackingByOrderId(orderId);

    res.status(StatusCodes.OK).json({
        status: true,
        message: 'Tracking retrieved successfully',
        data: tracking,
    });
});

// [GET] /tracking/outlet/:outletId
const getTrackingByOutlet = catchAsync(async (req, res) => {
    const { outletId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getTrackingByOutletId(outletId, parseInt(page), parseInt(limit));

    res.status(StatusCodes.OK).json({
        status: true,
        message: 'Tracking list retrieved successfully',
        data: result,
    });
});

// [PATCH] /tracking/outlet/:outletId
const updateTracking = catchAsync(async (req, res) => {
    const { outletId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: 'Status is required'
        });
    }

    const updatedCount = await updateTrackingByOutlet(outletId, status);

    res.status(StatusCodes.OK).json({
        status: true,
        message: updatedCount > 0 
            ? `${updatedCount} tracking(s) updated successfully`
            : 'No tracking updated',
    });
});

module.exports = {
    getTrackingByOrder,
    getTrackingByOutlet,
    updateTracking
};
