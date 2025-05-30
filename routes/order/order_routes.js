const express = require("express");
const router = express.Router();

const {
  createOrderByCashierController,
  createOrderByUserController,
  getOrderByIdController,
  getAllOrdersByOutletController,
  getAllOrdersController,
  cancelOrderController,
  calculateTotalController

} = require("../../controller/order/order_controller");

// [POST] /orders - Buat order baru
router.post("/orders/cashiers", createOrderByCashierController);
router.post("/orders/total",  calculateTotalController);
router.post("/orders/customers", createOrderByUserController);

// [GET] /orders - Ambil semua order (untuk admin)
router.get("/orders", getAllOrdersController);

// [GET] /orders/outlet/:outletId - Ambil semua order berdasarkan outlet
router.get("/orders/outlet/:outletId", getAllOrdersByOutletController);

// [GET] /orders/:id - Ambil detail order berdasarkan ID
router.get("/orders/:id", getOrderByIdController);





// [DELETE] /orders/:id - Batalkan order
router.delete("/orders/:id", cancelOrderController);

module.exports = router;
