const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getProfitDetailByOrder,
  createProfitRecord,
  getAllProfits,
  getDailyProfitSummary,
  calculateProfitByDateRange,
  getMonthlyProfitSummary
} = require('../../service/profit/profit_service');

// CREATE PROFIT RECORD
const createProfitRecordController = catchAsync(async (req, res) => {
  const { orderId, revenue, cost, profit } = req.body; // Destructuring req.body

  const newProfitRecord = await createProfitRecord({
    orderId,
    revenue,
    cost,
    profit
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Profit record successfully created',
    data: newProfitRecord
  });
});

// GET PROFIT DETAIL BY ORDER ID
const getProfitDetailByOrderController = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const profitDetail = await getProfitDetailByOrder(orderId);
  if (!profitDetail) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Profit detail for this order not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Profit details retrieved successfully',
    data: profitDetail
  });
});

// GET ALL PROFITS
const getAllProfitsController = catchAsync(async (req, res) => {
  const profits = await getAllProfits();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All profit records retrieved successfully',
    data: profits
  });
});

// GET DAILY PROFIT SUMMARY
const getDailyProfitSummaryController = catchAsync(async (req, res) => {
  const { date } = req.params;
  const dailyProfitSummary = await getDailyProfitSummary(date);
  if (!dailyProfitSummary) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'No profit summary found for this date',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Daily profit summary retrieved successfully',
    data: dailyProfitSummary
  });
});

// CALCULATE PROFIT BY DATE RANGE
const calculateProfitByDateRangeController = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const profitByDateRange = await calculateProfitByDateRange(startDate, endDate);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Profit calculated for the given date range',
    data: profitByDateRange
  });
});

// GET MONTHLY PROFIT SUMMARY
const getMonthlyProfitSummaryController = catchAsync(async (req, res) => {
  const { month, year } = req.params;
  const monthlyProfitSummary = await getMonthlyProfitSummary(month, year);
  if (!monthlyProfitSummary) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'No profit summary found for this month',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Monthly profit summary retrieved successfully',
    data: monthlyProfitSummary
  });
});

module.exports = {
  createProfitRecordController,
  getProfitDetailByOrderController,
  getAllProfitsController,
  getDailyProfitSummaryController,
  calculateProfitByDateRangeController,
  getMonthlyProfitSummaryController
};
