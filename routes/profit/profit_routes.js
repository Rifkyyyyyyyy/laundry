const express = require("express");
const router = express.Router();

const {
  getProfitDetailByOrderController,
  createProfitRecordController,
  getAllProfitsController,
  getDailyProfitSummaryController,
  calculateProfitByDateRangeController,
  getMonthlyProfitSummaryController
} = require('../../controller/profit/profit_controller');

// [POST] /profit - Tambah data profit baru
router.post("/profit", createProfitRecordController);

// [GET] /profit - Ambil semua data profit
router.get("/profit", getAllProfitsController);

// [GET] /profit/order/:orderId - Ambil detail profit berdasarkan order ID
router.get("/profit/order/:orderId", getProfitDetailByOrderController);

// [GET] /profit/daily-summary - Ringkasan profit harian
router.get("/profit/daily-summary", getDailyProfitSummaryController);

// [GET] /profit/monthly-summary - Ringkasan profit bulanan
router.get("/profit/monthly-summary", getMonthlyProfitSummaryController);

// [GET] /profit/by-range - Hitung profit berdasarkan rentang tanggal
router.get("/profit/by-range", calculateProfitByDateRangeController);

module.exports = router;
