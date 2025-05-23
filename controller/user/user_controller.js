const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const { getCashierService, getAllCustomerService, searchCustomerService } = require('../../service/user/user_service');

// Controller untuk mendapatkan daftar cashier
const getCashierController = catchAsync(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;

  const cashiers = await getCashierService(page, limit);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cashier retrieved successfully',
    data: cashiers
  });
});

// Controller untuk mendapatkan daftar customer
const getAllCustomerController = catchAsync(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const customers = await getAllCustomerService(page, limit);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Customer retrieved successfully',
    data: customers
  });
});



const searchAllCustomerController = catchAsync(async (req, res) => {
  const { searchTerm = '', page = 1, limit = 5 } = req.query;

  const result = await searchCustomerService(searchTerm, parseInt(page), parseInt(limit));

  return res.status(StatusCodes.OK).json({
    status: true,
    message: 'Pencarian customer berhasil.',
    data: result

  });
});


module.exports = {
  getCashierController,
  getAllCustomerController,
  searchAllCustomerController
};
