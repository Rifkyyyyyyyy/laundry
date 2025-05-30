const express = require("express");
const { 
  createPaymentController, 
  updateStatusFromMidtransController, 
  getAllPaymentsController, 
  getPaymentsByOutletController 
} = require("../../controller/payment/payment_controller");
const router = express.Router();

router.post('/create-payment', createPaymentController);
router.post('/payment-notification', updateStatusFromMidtransController);

// Route untuk ambil semua payment tanpa filter
router.get('/payments', getAllPaymentsController);

// Route untuk ambil payment berdasarkan outletId
router.get('/payments/outlet/:outletId', getPaymentsByOutletController);

module.exports = router;
