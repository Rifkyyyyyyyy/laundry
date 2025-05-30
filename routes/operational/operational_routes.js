const express = require("express");
const router = express.Router();

const {
  createReportController,
  addFeedbackController,
  getAllReportsController,
  getReportsByOutletController,
  getUnresolvedReportsController,
  resolveReportController ,
  updateReportController
} = require('../../controller/operational/operational_controler');

// Create new operational report
router.post('/reports', createReportController);

// Get all reports (with pagination)
router.get('/reports', getAllReportsController);

// Get all reports by outletId (with pagination)
router.get('/reports/outlet/:outletId', getReportsByOutletController);

// Get unresolved reports by outletId
router.get('/reports/unresolved/:outletId', getUnresolvedReportsController);

// Update operational report by reportId
router.put('/reports/:reportId', updateReportController);

// Add feedback (answer) by owner to a report
router.post('/reports/:reportId/feedback', addFeedbackController);

// Resolve report by reportId
router.put('/reports/:reportId/resolve', resolveReportController);


module.exports = router;
