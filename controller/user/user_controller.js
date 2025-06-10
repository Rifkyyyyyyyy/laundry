const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getCashierService,
  getAllCustomerService,
  searchCustomerService,
  deleteUserService,
  updateUserService
} = require('../../service/user/user_service');
const { formatImageToBase64 } = require('../../utils/func');

// Controller untuk mendapatkan daftar kasir
const getCashierController = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const cashiers = await getCashierService(page, limit);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Cashier retrieved successfully',
    data: cashiers
  });
});

// Controller untuk mendapatkan daftar customer
const getAllCustomerController = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const customers = await getAllCustomerService(page, limit);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Customer retrieved successfully',
    data: customers
  });
});

// Controller untuk pencarian customer
const searchAllCustomerController = catchAsync(async (req, res) => {
  const { searchTerm = '', page = 1, limit = 5 } = req.query;

  const result = await searchCustomerService(searchTerm, parseInt(page), parseInt(limit));

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Pencarian customer berhasil.',
    data: result
  });
});

// Controller untuk update user
const updateUserController = catchAsync(async (req, res) => {
  const id = req.params.id;

  // Mengambil data update dari request body
  const {
    email,
    username,
    password,
    address,
    lat,
    long,
    phone,
    outletId,
  } = req.body;

  // Ambil file image dari req.files (biasanya array atau objek)
  const imageFile = req.files?.image;

  let formattedImage = null;
  if (imageFile) {
   
    formattedImage = formatImageToBase64(imageFile);
  }

  const updatedUser = await updateUserService(
    id,
    email,
    username,
    password,
    formattedImage,
    address,
    lat,
    long,
    phone,
    outletId
  );

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'User updated successfully',
    data: updatedUser,
  });
});


// Controller untuk delete user
const deleteUserController = catchAsync(async (req, res) => {
  const userId = req.params.id;

  await deleteUserService(userId);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  getCashierController,
  getAllCustomerController,
  searchAllCustomerController,
  updateUserController,
  deleteUserController
};
