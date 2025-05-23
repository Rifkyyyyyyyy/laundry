const express = require("express");
const router = express.Router();

const {
    getOutletByNameController,
    getOutletsByLocationController,
    createOutletController,
    deleteOutletController,
    getAllOutletsController,
    updateOutletController,
    getAllListOutletController
} = require('../../controller/outlet/outlet_controller');

// [POST] /outlet - Tambah outlet baru
router.post("/outlet", createOutletController);

// [GET] /outlet - Ambil semua outlet
router.get("/outlet", getAllOutletsController);
router.get("/outlet/list", getAllListOutletController)

// [GET] /outlet/location/:location - Ambil outlet berdasarkan lokasi
router.get("/outlet/location/:location", getOutletsByLocationController);

// [GET] /outlet/name/:name - Ambil outlet berdasarkan nama
router.get("/outlet/name/:name", getOutletByNameController);

// [PATCH] /outlet/:id - Update outlet berdasarkan ID
router.patch("/outlet/:id", updateOutletController);

// [DELETE] /outlet/:id - Hapus outlet berdasarkan ID
router.delete("/outlet/:id", deleteOutletController);

module.exports = router;
