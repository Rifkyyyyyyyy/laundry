const express = require("express");
const router = express.Router();


const {
getTrackingByOrder ,
getTrackingByOutlet ,
updateTracking
} = require('../../controller/tracking/tracking_controller')


router.get('/tracking/:orderId', getTrackingByOrder);

// Route untuk ambil tracking berdasarkan outletId (semua tracking terkait outlet)
router.get('/tracking/outlet/:outletId', getTrackingByOutlet);

// Route untuk update tracking (misal status order berubah)
router.put('/tracking/:id', updateTracking);


module.exports = router;    
