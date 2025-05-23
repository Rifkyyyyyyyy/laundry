const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getTodayTrackingSummaryByOutletId
} = require('../../service/management/management_services');

const getTodayTrackingSummary = catchAsync(async (req, res) => {
  const outletId = req.params.outletId;
  const summary = await getTodayTrackingSummaryByOutletId(outletId);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: summary,
    message: 'Berhasil mengambil ringkasan tracking hari ini.'
  });
});

module.exports = {
  getTodayTrackingSummary,
};
