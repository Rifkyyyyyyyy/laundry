const express = require("express");
const router = express.Router();

const {
  getProductByIdController,
  getProductsByCategoryController,
  createProductController,
  deleteProductController,
  getAllProductsController,
  searchProductsController,
  updateProductController ,
} = require('../../controller/product/product_controller');

// [POST] /product - Tambah produk baru
router.post("/product", createProductController);

// [GET] /product - Ambil semua produk
router.get("/product", getAllProductsController);

// [GET] /product/search - Cari produk berdasarkan keyword
router.get("/product/search", searchProductsController);

// [GET] /product/category/:category - Ambil produk berdasarkan kategori
router.get("/product/category/:category", getProductsByCategoryController);

// [GET] /product/:id - Ambil produk berdasarkan ID
router.get("/product/:id", getProductByIdController);

// [PATCH] /product/:id - Update produk berdasarkan ID
router.patch("/product/:id", updateProductController);

// [DELETE] /product/:id - Hapus produk berdasarkan ID
router.delete("/product/:id", deleteProductController);

module.exports = router;
