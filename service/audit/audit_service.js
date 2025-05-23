const Order = require('../../model/order');
const ApiError = require('../../utils/apiError');
const { StatusCodes } = require('http-status-codes');


const getPopularItems = async () => {
  try {
    const result = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          totalSold: 1
        }
      }
    ]);

    return result;
  } catch (err) {
    throw new ApiError('Failed to get popular items', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};


const getTotalIncome = async () => {
  try {
    const result = await Order.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, totalEarn: { $sum: '$total' } } }
    ]);

    return result[0]?.totalEarn || 0;
  } catch (err) {
    throw new ApiError('Failed to calculate income', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};


const getOrderGrowth = async (startPeriod1, endPeriod1, startPeriod2, endPeriod2) => {
    try {
      const period1Orders = await Order.countDocuments({
        status: 'completed',
        completedAt: { $gte: startPeriod1, $lte: endPeriod1 }
      });
  
      const period2Orders = await Order.countDocuments({
        status: 'completed',
        completedAt: { $gte: startPeriod2, $lte: endPeriod2 }
      });
  
      const growth =
        period2Orders === 0
          ? 100
          : ((period1Orders - period2Orders) / period2Orders) * 100;
  
      return parseFloat(growth.toFixed(2));
    } catch (err) {
      throw new ApiError('Failed to calculate growth', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  const getTotalOrder = async () => {
    try {
      const count = await Order.countDocuments({ status: 'completed' });
      return count;
    } catch (err) {
      throw new ApiError('Failed to count total orders', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
  

  
module.exports = {
  getPopularItems,
  getTotalIncome,
  getOrderGrowth ,
  getTotalOrder
};
