const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getOrderById,
  getOrdersByDateRange,
  getOrdersByUser,
  cancelOrder,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  applyDiscountToOrder,
  calculateTotal
} = require('../../service/order/order_service');

// CREATE ORDER
const createOrderController = catchAsync(async (req, res) => {
  const { customerId, outletId, items, note, pickupDate } = req.body;

  // Create a new order
  const newOrder = await createOrder({ customerId, outletId, items, note, pickupDate });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Order successfully created',
    data: newOrder
  });
});

// GET ORDER BY ID
const getOrderByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const order = await getOrderById(id);
  if (!order) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Order not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Order retrieved successfully',
    data: order
  });
});

// GET ORDERS BY USER
const getOrdersByUserController = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const orders = await getOrdersByUser(userId);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Orders retrieved successfully',
    data: orders
  });
});

// GET ALL ORDERS
const getAllOrdersController = catchAsync(async (req, res) => {
  const orders = await getAllOrders();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All orders retrieved successfully',
    data: orders
  });
});

// GET ORDERS BY DATE RANGE
const getOrdersByDateRangeController = catchAsync(async (req, res) => {
  const { start, end } = req.query;
  const orders = await getOrdersByDateRange(start, end);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Orders by date range retrieved successfully',
    data: orders
  });
});

// CANCEL ORDER
const cancelOrderController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await cancelOrder(id);
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'Order successfully canceled',
    data: null
  });
});

// UPDATE ORDER STATUS
const updateOrderStatusController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedOrder = await updateOrderStatus(id, status);
  if (!updatedOrder) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Order not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Order status updated successfully',
    data: updatedOrder
  });
});

// APPLY DISCOUNT TO ORDER
const applyDiscountToOrderController = catchAsync(async (req, res) => {
  const { orderId, discountCode } = req.body;
  const updatedOrder = await applyDiscountToOrder(orderId, discountCode);
  if (!updatedOrder) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Order not found or discount invalid',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Discount successfully applied',
    data: updatedOrder
  });
});

module.exports = {
  createOrderController,
  getOrderByIdController,
  getOrdersByUserController,
  getAllOrdersController,
  getOrdersByDateRangeController,
  cancelOrderController,
  updateOrderStatusController,
  applyDiscountToOrderController
};
