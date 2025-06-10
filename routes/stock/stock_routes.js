const express = require("express");
const router = express.Router();

const {
  getAllInventory,
  addInventory,
  getInventoryByOutlet,
  updateStock ,
  deleteStock
} = require('../../controller/stock/stock_controller');

// Route: Ambil semua stok dari semua outlet (admin/owner)
router.get("/stock", getAllInventory);

// Route: Tambah item baru ke inventaris
router.post("/stock", addInventory);

// Route: Ambil inventaris berdasarkan outletId
router.get("/stock/outlet/:outletId", getInventoryByOutlet);

// Route: Update stok item berdasarkan itemId
router.patch("/stock/:itemId", updateStock);

router.delete('/stock/:id' , deleteStock)

module.exports = router;
