const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Order = require('../../model/order/order');
const Profit = require('../../model/profit/profit');

// CREATE PROFIT RECORD DARI ORDER
const createProfitRecord = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Order tidak ditemukan');

    const existing = await Profit.findOne({ orderId });
    if (existing) return existing;

    const profit = new Profit({
        orderId,
        amount: order.total,
        date: new Date(order.createdAt)
    });

    return await profit.save();
};

// GET DETAIL PROFIT DARI ORDER
const getProfitDetailByOrder = async (orderId) => {
    const profit = await Profit.findOne({ orderId }).populate('orderId');
    if (!profit) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Data keuntungan tidak ditemukan');
    return profit;
};

// GET TOTAL PROFIT BERDASARKAN RANGE TANGGAL
const calculateProfitByDateRange = async (start, end) => {
    const profits = await Profit.find({
        date: { $gte: new Date(start), $lte: new Date(end) }
    });

    const total = profits.reduce((sum, p) => sum + p.amount, 0);
    return { total, count: profits.length, details: profits };
};

// GET RINGKASAN PROFIT HARIAN
const getDailyProfitSummary = async (date) => {
    const targetDate = new Date(date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const profits = await Profit.find({
        date: { $gte: targetDate, $lt: nextDate }
    });

    const total = profits.reduce((sum, p) => sum + p.amount, 0);
    return { date: targetDate.toISOString().split('T')[0], total, count: profits.length };
};

// GET RINGKASAN PROFIT BULANAN
const getMonthlyProfitSummary = async (month) => {
    // format `month` adalah "2025-05"
    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const profits = await Profit.find({
        date: { $gte: start, $lt: end }
    });

    const total = profits.reduce((sum, p) => sum + p.amount, 0);
    return { month, total, count: profits.length };
};

// GET SEMUA DATA PROFIT
const getAllProfits = async () => {
    return await Profit.find().sort({ date: -1 }).populate('orderId');
};

module.exports = {
    createProfitRecord,
    getProfitDetailByOrder,
    calculateProfitByDateRange,
    getDailyProfitSummary,
    getMonthlyProfitSummary,
    getAllProfits
};
