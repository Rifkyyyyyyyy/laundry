const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const { getCashierService } = require('../../service/user/user_service');

// Controller untuk mendapatkan daftar cashier
const getCashierController = catchAsync(async (req, res) => {
  const page = req.query.page || 1;  // Ambil halaman dari query params, default 1
  const limit = req.query.limit || 10;  // Ambil limit dari query params, default 10

  const cashiers = await getCashierService(page, limit);  // Ambil daftar cashier dengan pagination
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cashier retrieved successfully',
    data: cashiers
  });
});

module.exports = {
  getCashierController
};
