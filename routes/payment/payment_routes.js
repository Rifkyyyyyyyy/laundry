const express = require("express");
const { createPaymentController , updateStatusFromMidtransController } = require("../../controller/payment/payment_controller");
const router = express.Router();



router.post('/create-payment', createPaymentController);
router.post('/payment-notification' , updateStatusFromMidtransController);

module.exports = router;
