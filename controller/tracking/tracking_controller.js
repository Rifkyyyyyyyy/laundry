const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
    getTrackingByOrderId,
    getTrackingByOutletId,
    updateTrackingById
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
    const { id } = req.params;  // id tracking
    const { status } = req.body;

    console.log(`status : ${status} id : ${id}`);

    if (!status) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: 'Status is required'
        });
    }

    // updateTrackingById harus mengembalikan data baru (updated tracking)
    const updatedTracking = await updateTrackingById(id, status);

    if (!updatedTracking) {
        return res.status(StatusCodes.NOT_FOUND).json({
            status: false,
            message: 'Tracking not found or not updated',
        });
    }

    res.status(StatusCodes.OK).json({
        status: true,
        message: 'Tracking updated successfully',
        data: updatedTracking  // ini data tracking terbaru yang sudah diupdate
    });
});


module.exports = {
    getTrackingByOrder,
    getTrackingByOutlet,
    updateTracking
};
