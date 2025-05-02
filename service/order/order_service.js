const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Order = require('../../model/order/order');
const Discount = require('../../model/discount/discount');
const Product = require('../../model/product/product');

// CREATE ORDER
const createOrder = async (data) => {
  if (!data.items || data.items.length === 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Order harus memiliki item');
  }

  if (!data.pickupDate || new Date(data.pickupDate) < new Date()) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Tanggal pickup tidak valid');
  }

  const itemsWithSubtotal = await Promise.all(data.items.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan');

    const subtotal = item.quantity * product.pricePerKg;

    return {
      productId: item.productId,
      quantity: item.quantity,
      pricePerKg: product.pricePerKg,
      subtotal
    };
  }));

  const total = itemsWithSubtotal.reduce((acc, item) => acc + item.subtotal, 0);

  const newOrder = new Order({
    customerId: data.customerId,
    outletId: data.outletId,
    items: itemsWithSubtotal,
    total,
    note: data.note,
    pickupDate: data.pickupDate
  });

  return await newOrder.save();
};

// GET ORDER BY ID
const getOrderById = async (id) => {
  const order = await Order.findById(id).populate('items.productId');
  if (!order) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Order tidak ditemukan');
  return order;
};

// GET ORDERS BY USER
const getOrdersByUser = async (userId) => {
  return await Order.find({ customerId: userId }).sort({ createdAt: -1 });
};

// GET ALL ORDERS
const getAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 }).populate('customerId');
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (id, status) => {
  const allowedStatuses = ['pending', 'in_progress', 'completed', 'taken'];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Status tidak valid');
  }

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Order tidak ditemukan');
  return order;
};

// CANCEL ORDER
const cancelOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Order tidak ditemukan');

  if (order.status !== 'pending') {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Hanya order dengan status pending yang bisa dibatalkan');
  }

  await order.deleteOne();
  return { message: 'Order berhasil dibatalkan' };
};

// CALCULATE TOTAL (helper)
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.quantity * item.pricePerKg), 0);
};


// APPLY DISCOUNT TO ORDER
const applyDiscountToOrder = async (orderId, discountCode) => {
  const order = await Order.findById(orderId).populate('items.productId');
  if (!order) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Order tidak ditemukan');

  if (order.discountCode) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Diskon sudah diterapkan pada order ini');
  }

  const discount = await Discount.findOne({ code: discountCode, status: 'active' });
  if (!discount) throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Kode diskon tidak valid');

  const now = new Date();
  if (now < discount.validFrom || now > discount.validUntil) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Diskon tidak berlaku saat ini');
  }

  let discountAmount = 0;

  // Jika diskon hanya berlaku pada produk tertentu
  if (discount.applicableProductIds.length > 0) {
    order.items.forEach(item => {
      if (discount.applicableProductIds.includes(item.productId._id.toString())) {
        // Diskon per produk berdasarkan subtotal
        const productDiscount = item.subtotal * (discount.discountAmount / 100);
        discountAmount += productDiscount;
      }
    });
  } else {
    // Jika diskon berlaku untuk seluruh order
    discountAmount = order.total * (discount.discountAmount / 100);
  }

  const newTotal = order.total - discountAmount;
  order.total = newTotal;
  order.discountCode = discount.code;
  order.discountAmount = discountAmount;

  await order.save();

  return await Order.findById(orderId).populate('items.productId');
};

// GET ORDERS BY DATE RANGE
const getOrdersByDateRange = async (start, end) => {
  return await Order.find({
    createdAt: {
      $gte: new Date(start),
      $lte: new Date(end)
    }
  }).sort({ createdAt: -1 });
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  calculateTotal,
  applyDiscountToOrder,
  getOrdersByDateRange
};
