const express = require("express");
const router = express.Router();

const {
  createDiscountByOutletController,
  deleteDiscountController,
  updateDiscountController,
  getAllDiscountController,
  getDiscountsByOutletController,
} = require('../../controller/discount/discount_controller');

// [POST] /discount - Tambah diskon baru
router.post("/discount", createDiscountByOutletController);

// [GET] /discount - Ambil semua diskon
router.get("/discount", getAllDiscountController);

// [GET] /discount/by-outlet/:outletId - Ambil diskon berdasarkan outlet
router.get("/discount/by-outlet/:outletId", getDiscountsByOutletController);

// [PUT] /discount/:discountId - Update diskon
router.put("/discount/:discountId", updateDiscountController);

// [DELETE] /discount/:discountId - Hapus diskon
router.delete("/discount/:discountId", deleteDiscountController);

module.exports = router;
