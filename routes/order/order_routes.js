const express = require("express");
const router = express.Router();

const { 
    getOrderByIdController,
    getOrdersByDateRangeController,
    getOrdersByUserController,
    cancelOrderController,
    createOrderController,
    getAllOrdersController,
    updateOrderStatusController,
    applyDiscountToOrderController
} = require("../../controller/order/order_controller");

// [POST] /order - Buat order baru
router.post("/order", createOrderController);

// [GET] /order - Get all orders (dengan optional query filter, misal: ?userId=... atau dateRange)
router.get("/order", getAllOrdersController);

// [GET] /order/:id - Get order by ID
router.get("/order/:id", getOrderByIdController);

// [GET] /order/date-range - Filter order by tanggal
router.get("/order/date-range", getOrdersByDateRangeController);

// [GET] /order/by-user - Filter order by userId
router.get("/order/by-user", getOrdersByUserController);

// [PATCH] /order/:id/cancel - Batalkan order
router.patch("/order/:id/cancel", cancelOrderController);

// [PATCH] /order/:id/status - Update status order
router.patch("/order/:id/status", updateOrderStatusController);

// [PATCH] /order/:id/apply-discount - Tambahkan diskon ke order
router.patch("/order/:id/apply-discount", applyDiscountToOrderController);

module.exports = router;
