const Tracking = require('../../model/tracking/tracking');
const ApiError = require('../../utils/apiError');
const mongoose = require('mongoose');
const { STATUS_CODES } = require('http');

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getTodayTrackingSummaryByOutletId = async (outletId) => {
  try {
    const today = getStartOfToday();

    if (!mongoose.Types.ObjectId.isValid(outletId)) {
      throw new ApiError(400, 'ID outlet tidak valid');
    }

    const outletObjectId = new mongoose.Types.ObjectId(String(outletId));

    const [pendingResult, toProcessResult, inProgressResult, takenResult] = await Promise.all([
      // pending: belum bayar, status paling awal harus 'Order Created'
      Tracking.aggregate([
        { $unwind: '$logs' },
        // ambil logs hari ini dengan status 'Order Created'
        { $match: { 'logs.status': 'Order Created', 'logs.timestamp': { $gte: today } } },
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: '$order' },
        {
          $match: {
            'order.outletId': outletObjectId,
            'order.paymentStatus': 'unpaid'
          }
        },
        { $count: 'total' }
      ]),

      // toProcess: sudah bayar tapi status masih 'Order Created'
      Tracking.aggregate([
        { $unwind: '$logs' },
        { $match: { 'logs.status': 'Order Created', 'logs.timestamp': { $gte: today } } },
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: '$order' },
        {
          $match: {
            'order.outletId': outletObjectId,
            'order.paymentStatus': 'paid'
          }
        },
        { $count: 'total' }
      ]),

      // inProgress: status 'In Progress'
      Tracking.aggregate([
        { $unwind: '$logs' },
        { $match: { 'logs.status': 'In Progress', 'logs.timestamp': { $gte: today } } },
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: '$order' },
        { $match: { 'order.outletId': outletObjectId } },
        { $count: 'total' }
      ]),

      // taken: status 'Taken'
      Tracking.aggregate([
        { $unwind: '$logs' },
        { $match: { 'logs.status': 'Taken', 'logs.timestamp': { $gte: today } } },
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: '$order' },
        { $match: { 'order.outletId': outletObjectId } },
        { $count: 'total' }
      ])
    ]);

    return {
      pending: pendingResult.length > 0 ? pendingResult[0].total : 0,
      toProcess: toProcessResult.length > 0 ? toProcessResult[0].total : 0,
      inProgress: inProgressResult.length > 0 ? inProgressResult[0].total : 0,
      taken: takenResult.length > 0 ? takenResult[0].total : 0,
    };

  } catch (err) {
    console.error('Error in getTodayTrackingSummaryByOutletId:', err);
    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      'Terjadi kesalahan saat mengambil ringkasan tracking hari ini.'
    );
  }
};

module.exports = {
  getTodayTrackingSummaryByOutletId
};
