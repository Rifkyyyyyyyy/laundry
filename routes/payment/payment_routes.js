const express = require("express");
const { createPaymentController } = require("../../controller/payment/payment_controller");
const router = express.Router();



router.post('/create-payment', createPaymentController);

module.exports = router;
