const router = require('express').Router();
const {
  getTodayTrackingSummary,
} = require('../../controller/management/management_controler');

router.get('/outlets/:outletId/trackings/summary', getTodayTrackingSummary);

module.exports = router;
