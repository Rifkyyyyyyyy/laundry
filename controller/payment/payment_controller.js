const { createPaymentServices, updateStatusBasedOnMidtransServer } = require('../../service/payment/payment_services');
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

module.exports = {
  createPaymentController,
  updateStatusFromMidtransController,
};
