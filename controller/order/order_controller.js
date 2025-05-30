const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  createOrderByCashierService,
  createOrderByUserService,
  getAllOrdersByOutletService,
  calculateTotal,
  getAllOrdersService,
  getOrderByIdService,
  cancelOrderServices,
} = require('../../service/order/order_service');

// CREATE ORDER
const createOrderByUserController = catchAsync(async (req, res) => {
  const {
    customerId,
    outletId,
    items,
    pickupDate,
    note,
    paymentType,
    discountCode,
    serviceType = 'regular',
  } = req.body;

  const order = await createOrderByUserService({
    customerId,
    outletId,
    items,
    pickupDate,
    note,
    paymentType,
    discountCode,
    serviceType
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Order berhasil dibuat',
    data: order,
  });
});





const createOrderByCashierController = catchAsync(async (req, res) => {
  const {
    processedBy,
    customerName,
    customerPhone,
    customerEmail,
    outletId,
    items,
    pickupDate,
    note,
    paymentType = 'cash',
    serviceType = 'regular',
    memberCode,
  } = req.body;

  console.log(`data : ${JSON.stringify(req.body)}`);

  const order = await createOrderByCashierService({
    processedBy,
    customerName,
    customerPhone,
    customerEmail,
    outletId,
    items,
    pickupDate,
    note,
    paymentType,
    serviceType,
    memberCode
  })

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Order berhasil dibuat',
    data: order,
  });
});


const calculateTotalController = catchAsync(async (req, res) => {
  const { items, serviceType = 'regular', memberLevel = null } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: 'Order harus memiliki minimal satu item',
    });
  }

  // Hitung total dengan fungsi calculateTotal
  const total = await calculateTotal(items, serviceType, memberLevel);

  console.log(total);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Total berhasil dihitung',
    data: total
  });
});




// GET ORDER BY ID
const getOrderByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;

  const order = await getOrderByIdService(id);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Detail order berhasil diambil',
    data: order,
  });
});

// GET ALL ORDERS BY OUTLET
const getAllOrdersByOutletController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const data = await getAllOrdersByOutletService(Number(page), Number(limit), outletId);

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Daftar order untuk outlet ${outletId} berhasil diambil`,
    data,
  });
});

// GET ALL ORDERS
const getAllOrdersController = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const data = await getAllOrdersService(Number(page), Number(limit));

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Daftar order dari semua outlet berhasil diambil',
    data,
  });
});

// CANCEL ORDER
const cancelOrderController = catchAsync(async (req, res) => {
  const { id } = req.params;

  const cancelled = await cancelOrderServices(id);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Order berhasil dibatalkan',
    data: cancelled,
  });
});

module.exports = {
  createOrderByUserController,
  createOrderByCashierController,
  calculateTotalController ,
  getOrderByIdController,
  getAllOrdersByOutletController,
  getAllOrdersController,
  cancelOrderController,
};
