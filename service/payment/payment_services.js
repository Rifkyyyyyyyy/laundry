// services/payment/paymentService.js
const crypto = require('crypto');
const ApiError = require('../../utils/apiError');
const { StatusCodes } = require('http-status-codes');

const Order = require('../../model/order/order');
const Payment = require('../../model/payment/payment');
const Tracking = require('../../model/tracking/tracking');
const { snapApi } = require('../../midtrans');
const catchAsync = require('../../utils/catchAsync');

const createPaymentServices = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('customerId')
      .populate('items.productId');

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order tidak ditemukan');
    }

    if (order.paymentType === 'cash') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Metode pembayaran cash tidak memerlukan pembayaran melalui Midtrans'
      );
    }

    const item_details = order.items.map(item => {
      const price = item.pricePerItem || item.pricePerKg || 0;
      return {
        id: item.productId._id.toString(),
        name: item.productId.name,
        price: Number(price),
        quantity: item.quantity,
      };
    });

    let gross_amount = item_details.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let serviceFee = 0;
    if (order.serviceType === 'express') {
      serviceFee = 5000;
    } else if (order.serviceType === 'super_express') {
      serviceFee = 10000;
    }

    if (serviceFee > 0) {
      item_details.push({
        id: 'service_fee',
        name: `Biaya Layanan (${order.serviceType})`,
        price: serviceFee,
        quantity: 1,
      });
      gross_amount += serviceFee;
    }

    if (order.discountAmount && order.discountAmount > 0) {
      gross_amount -= order.discountAmount;
    }

   

    if (Math.abs(gross_amount - order.total) > 1) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Perhitungan gross_amount tidak sesuai dengan total'
      );
    }

    const payload = {
      transaction_details: {
        order_id: order.orderCode,
        gross_amount,
      },
      item_details,
      customer_details: {
        first_name: order.customerId?.username || order.customerName || 'Customer',
        email: order.customerId?.email || order.customerEmail || '',
      },
      enabled_payments: [
        'bank_transfer', 'bca_va', 'bni_va', 'bri_va', 'permata_va', 'echannel', 'other_va',
      ],
      description: 'Pembayaran order laundry',
    };

    console.log(`Midtrans Payload:\n${JSON.stringify(payload, null, 2)}`);
    const transaction = await snapApi.createTransaction(payload);
    return transaction;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || 'Gagal membuat transaksi pembayaran'
    );
  }
};

const updateStatusBasedOnMidtransServer = catchAsync(async (data) => {
  try {
    const {
      order_id, status_code, gross_amount,
      signature_key, transaction_status,
      fraud_status, payment_type,
      transaction_id, settlement_time
    } = data;
  
    const serverKey = process.env.MIDTRANS_SERVER_KEY.trim();
    const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const computedHash = crypto.createHash('sha512').update(rawString).digest('hex');
  
    if (signature_key !== computedHash) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Signature tidak valid', 'INVALID_SIGNATURE');
    }
  
    const order = await Order.findOne({ orderCode: order_id });
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order tidak ditemukan');
    }
  
    let paymentStatus = 'pending';
    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      paymentStatus = 'paid';
    } else if (transaction_status === 'expire' || transaction_status === 'cancel') {
      paymentStatus = transaction_status;
    }
  
    let payment = await Payment.findOne({ orderId: order._id });
    if (!payment) {
      payment = new Payment({
        orderId: order._id,
        invoiceNumber: 'INV-' + Date.now(),
        paymentType: payment_type,
        paymentStatus,
        amountPaid: gross_amount,
        paidAt: settlement_time ? new Date(settlement_time) : new Date(),
        transactionId: transaction_id,
        metadata: data,
      });
    } else {
      payment.paymentStatus = paymentStatus;
      payment.transactionId = transaction_id;
      payment.paidAt = settlement_time ? new Date(settlement_time) : new Date();
      payment.metadata = data;
    }
  
    await payment.save();
  
    if (paymentStatus === 'paid') {
      order.paymentStatus = 'paid';
      await order.save();
  
      let tracking = await Tracking.findOne({ orderId: order._id });
      if (!tracking) {
        tracking = new Tracking({
          orderId: order._id,
          logs: [
            { status: 'Order Created' },
          ]
        });
      } else {
        tracking.logs.push({ status: 'Payment Received' });
      }
  
      await tracking.save();
    }
  
    return payment;
  } catch (error) {
     console.log(`error : ${error}`);
  }
});

module.exports = {
  createPaymentServices,
  updateStatusBasedOnMidtransServer
};
