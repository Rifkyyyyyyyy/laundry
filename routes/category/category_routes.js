const express = require("express");
const router = express.Router();

const {
  createCategoryController,
  getCategoryByIdController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  getActiveCategoriesController ,
  getAllNamePhotoCategoriesController
} = require('../../controller/category/category_controller');

// [POST] /category - Tambah kategori baru
router.post("/category", createCategoryController);

// [GET] /category - Ambil semua kategori
router.get("/category", getAllCategoriesController);

router.get("/category/all", getAllNamePhotoCategoriesController);

// [GET] /category/active - Ambil semua kategori yang aktif
router.get("/category/active", getActiveCategoriesController);

// [GET] /category/:id - Ambil kategori berdasarkan ID
router.get("/category/:id", getCategoryByIdController);

// [PUT] /category/:id - Update kategori berdasarkan ID
router.put("/category/:id", updateCategoryController);

// [DELETE] /category/:id - Hapus kategori berdasarkan ID
router.delete("/category/:id", deleteCategoryController);

module.exports = router;
