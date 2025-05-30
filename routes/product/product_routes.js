const express = require("express");
const router = express.Router();

const {
  getProductByIdController,
  getProductsByCategoryController,
  createProductController,
  deleteProductController,
  getAllProductsController,
  searchProductsController,
  updateProductController,
  getProductsByOutletIdController ,
  getAllProductByOutletController
} = require('../../controller/product/product_controller');

// [POST] /product - Tambah produk baru
router.post("/product", createProductController);

// [GET] /product - Ambil semua produk dengan pagination
router.get("/product", getAllProductsController);

router.get("/product/all/:outletId", getAllProductByOutletController);


// [GET] /product/search - Cari produk berdasarkan keyword
router.get("/product/search", searchProductsController);

// [GET] /product/category/:categoryId - Ambil produk berdasarkan kategori
router.get("/product/category/:categoryId", getProductsByCategoryController);

// [GET] /product/:id - Ambil produk berdasarkan ID
router.get("/product/:id", getProductByIdController);

// [PATCH] /product/:id - Update produk berdasarkan ID
router.patch("/product/:id", updateProductController);

// [DELETE] /product/:id - Hapus produk berdasarkan ID
router.delete("/product/:id", deleteProductController);

// [GET] /product/outlet/:outletId - Ambil produk berdasarkan Outlet ID dengan pagination
router.get("/product/outlet/:outletId", getProductsByOutletIdController);

module.exports = router;
