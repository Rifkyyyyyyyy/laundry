const {
  createPaymentServices,
  updateStatusBasedOnMidtransServer,
  getAllPaymentBasedOnOutletId,
  getAllPayments
} = require('../../service/payment/payment_services');
const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../utils/apiError');

// Controller untuk membuat transaksi pembayaran
const createPaymentController = catchAsync(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'orderId harus disertakan');
  }

  const transaction = await createPaymentServices(orderId);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Payment transaction created successfully',
    data: transaction // Hasil transaksi dari Midtrans
  });
});

// Controller untuk update status order dari Midtrans (misalnya notifikasi webhook)
const updateStatusFromMidtransController = catchAsync(async (req, res) => {
  const result = await updateStatusBasedOnMidtransServer(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Status order berhasil diperbarui berdasarkan notifikasi Midtrans',
    data: result
  });
});

// Controller untuk ambil semua payment berdasarkan outletId
const getPaymentsByOutletController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;


  if (!outletId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'outletId harus disertakan');
  }

  const payments = await getAllPaymentBasedOnOutletId({ page, limit, outletId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Daftar pembayaran berdasarkan outlet berhasil didapatkan',
    data: payments,
  });
});

// Controller untuk ambil semua payment tanpa filter
const getAllPaymentsController = catchAsync(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const payments = await getAllPayments({
    page ,
    limit
  });


  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Daftar semua pembayaran berhasil didapatkan',
    data: payments,
  });
});

module.exports = {
  createPaymentController,
  updateStatusFromMidtransController,
  getPaymentsByOutletController,
  getAllPaymentsController,
};
