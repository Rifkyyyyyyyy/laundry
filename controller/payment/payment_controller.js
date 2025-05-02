const { createPaymentServices } = require('../../service/payment/payment_services');
const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');


const createPaymentController = catchAsync(async (req, res) => {
    const { product_name, gross_amount, customer_name, customer_email, customer_phone, payment_method, description } = req.body;

    const transaction = await createPaymentServices(
        product_name, 
        gross_amount, 
        customer_name, 
        customer_email, 
        customer_phone, 
        payment_method, 
        description
    );

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Payment transaction created successfully',
        data: transaction // Hasil transaksi dari Midtrans
    });
});

module.exports = {
    createPaymentController
};
