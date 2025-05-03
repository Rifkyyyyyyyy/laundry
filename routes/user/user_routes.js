const express = require("express");
const router = express.Router();

const {
  getCashierController
} = require('../../controller/user/user_controller');

// [GET] /cashiers - Get all cashiers (with pagination)
router.get("/cashiers", getCashierController);

module.exports = router;
