const express = require("express");
const router = express.Router();

const {
  getCashierController,
  getAllCustomerController,
  searchAllCustomerController
} = require('../../controller/user/user_controller');

// [GET] /cashiers - Ambil semua kasir dengan pagination
router.get("/cashiers", getCashierController);

// [GET] /customers - Ambil semua customer dengan pagination
router.get("/customers", getAllCustomerController);


router.get("/customers/search", searchAllCustomerController)

module.exports = router;
