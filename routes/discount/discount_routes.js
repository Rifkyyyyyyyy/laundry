const express = require("express");
const router = express.Router();

const {
    validateDiscountController,
    getDiscountByCodeController,
    createDiscountController,
    getAllDiscountsController,
    updateDiscountController,
    deleteDiscountController,
    getActiveDiscountsController,
} = require('../../controller/discount/discount_controller');

// [POST] /discount - Tambah diskon baru
router.post("/discount", createDiscountController);

// [GET] /discount - Ambil semua diskon
router.get("/discount", getAllDiscountsController);

// [GET] /discount/active - Ambil semua diskon yang aktif
router.get("/discount/active", getActiveDiscountsController);

// [GET] /discount/code/:code - Ambil diskon berdasarkan kode
router.get("/discount/code/:code", getDiscountByCodeController);

// [POST] /discount/validate - Validasi kode diskon (input lewat body)
router.post("/discount/validate", validateDiscountController);

// [PATCH] /discount/:id - Update diskon berdasarkan ID
router.patch("/discount/:id", updateDiscountController);

// [DELETE] /discount/:id - Hapus diskon berdasarkan ID
router.delete("/discount/:id", deleteDiscountController);

module.exports = router;
