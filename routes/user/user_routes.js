const express = require("express");
const router = express.Router();

const {
  getCashierController,
  getAllCustomerController,
  searchAllCustomerController,
  updateUserController,
  deleteUserController,
} = require("../../controller/user/user_controller");



// [GET] /cashiers - Ambil semua kasir dengan pagination
router.get("/cashiers", getCashierController);

// [GET] /customers - Ambil semua customer dengan pagination
router.get("/customers", getAllCustomerController);

// [GET] /customers/search - Cari customer berdasarkan query
router.get("/customers/search", searchAllCustomerController);

// [PUT] /users/:id - Update user dengan upload image opsional
router.put("/users/:id", updateUserController);

// [DELETE] /users/:id - Hapus user berdasarkan id
router.delete("/users/:id", deleteUserController);

module.exports = router;
