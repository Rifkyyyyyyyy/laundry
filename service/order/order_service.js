const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../utils/apiError');
const Order = require('../../model/order/order');
const Discount = require('../../model/discounts/discount');
const Product = require('../../model/product/product');
const Member = require('../../model/member/member');
const User = require('../../model/user/user');
const { generateQueueNumber, getPagination } = require('../../utils/func');
const crypto = require('crypto');


const Tracking = require('../../model/tracking/tracking');
const Payment = require('../../model/payment/payment')

const createOrderByUserService = async ({
  customerId,
  outletId,
  items,
  pickupDate,
  note,
  paymentType,
  discountCode,
  serviceType = 'regular',
}) => {
  try {
    if (!customerId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'customerId wajib untuk order online');
    }

    if (!items || items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Order harus memiliki item');
    }

    if (!['ewallet', 'bank_transfer'].includes(paymentType)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Order online hanya bisa dengan ewallet atau bank transfer');
    }

    const user = await User.findById(customerId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User tidak ditemukan');

    const today = new Date();
    const pickup = new Date(pickupDate);
    pickup.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (!pickupDate || pickup < today) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tanggal pickup tidak valid');
    }

    if (!user.username || user.username.trim() === '') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Nama pelanggan wajib diisi');
    }

    const orderCode = 'ORD-' + crypto.createHash('md5')
      .update(`${customerId}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .slice(0, 12);

    // Hitung subtotal tiap item
    const itemsWithSubtotal = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Produk tidak ditemukan');

      const unitPrice = product.price;
      const unit = product.unit;
      const subtotal = item.quantity * unitPrice;

      return {
        productId: item.productId,
        quantity: item.quantity,
        pricePerKg: unit === 'kg' ? unitPrice : undefined,
        pricePerItem: unit === 'item' ? unitPrice : undefined,
        subtotal,
      };
    }));

    let total = itemsWithSubtotal.reduce((acc, item) => acc + item.subtotal, 0);

    // Biaya layanan berdasarkan serviceType

    let serviceFee = 0;
    if (serviceType === 'express') {
      serviceFee = 5000;
    } else if (serviceType === 'super_express') {
      serviceFee = 10000;
    }

    total += serviceFee;

    // Cek diskon voucher
    let discountAmount = 0;
    let appliedDiscountCode = null;
    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode,
        status: 'active',
        outlet: outletId,
        validFrom: { $lte: today },
        validUntil: { $gte: today },
      });

      if (!discount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Diskon tidak ditemukan atau tidak berlaku');
      }

      if (discount.maxUsage !== null && discount.usageCount >= discount.maxUsage) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Voucher sudah mencapai batas penggunaan');
      }

      discountAmount += discount.discountAmount;
      appliedDiscountCode = discountCode;

      discount.usageCount += 1;
      await discount.save();
    }

    // Cek member dan diskon member
    const member = await Member.findOne({
      userId: customerId,
      outletId,
      expiredDate: { $gte: today }
    });

    if (member) {
      let memberDiscountPercent = 0;
      switch (member.membershipLevel) {
        case 'silver':
          memberDiscountPercent = 0.05;
          break;
        case 'gold':
          memberDiscountPercent = 0.10;
          break;
        case 'platinum':
          memberDiscountPercent = 0.15;
          break;
      }
      const memberDiscount = total * memberDiscountPercent;
      discountAmount += memberDiscount;
    }

    // Kurangi total dengan diskon (voucher + member)
    total -= discountAmount;
    if (total < 0) total = 0;

    const paymentStatus = 'unpaid';

    const estimationDaysMap = {
      regular: 3,
      express: 2,
      super_express: 1,
    };
    const estimationDays = estimationDaysMap[serviceType] || 3;
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(today.getDate() + estimationDays);

    const expireAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const newOrder = new Order({
      orderCode,
      customerId,
      outletId,
      items: itemsWithSubtotal,
      total,
      serviceFee,
      discountAmount,
      discountCode: appliedDiscountCode,
      note,
      pickupDate,
      paymentType,
      paymentStatus,
      serviceType,
      completedAt: estimatedCompletionDate,
      expireAt,
    });

    const savedOrder = await newOrder.save();

    return savedOrder;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Terjadi kesalahan saat membuat order');
  }
};


const createOrderByCashierService = async ({
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
}) => {
  try {
    if (!items || items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Order harus memiliki item');
    }

    if (paymentType !== 'cash') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Kasir hanya bisa membuat order dengan pembayaran cash');
    }

    if (!customerName?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Nama pelanggan wajib diisi');
    }

    if (!processedBy) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User kasir (processedBy) wajib diisi');
    }

    const today = new Date();
    const pickup = new Date(pickupDate);
    pickup.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (!pickupDate || pickup < today) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tanggal pickup tidak valid');
    }

    const orderCode = 'ORD-' + crypto.createHash('md5')
      .update(`${customerName}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .slice(0, 12);

    const itemsWithSubtotal = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.id);
      if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Produk tidak ditemukan');

      const unitPrice = product.price;
      const unit = product.unit;
      const subtotal = item.quantity * unitPrice;

      return {
        productId: item.id,
        quantity: item.quantity,
        pricePerKg: unit === 'kg' ? unitPrice : undefined,
        pricePerItem: unit === 'item' ? unitPrice : undefined,
        subtotal,
      };
    }));

    let total = itemsWithSubtotal.reduce((acc, item) => acc + item.subtotal, 0);

    let serviceFee = 0;
    if (serviceType === 'express') serviceFee = 5000;
    else if (serviceType === 'super_express') serviceFee = 10000;

    total += serviceFee;

    let discountAmount = 0;
    if (memberCode) {
      const member = await Member.findOne({ code: memberCode });
      if (!member) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Kode member tidak valid');
      }

      const discountMap = {
        silver: 0.05,
        gold: 0.10,
        platinum: 0.15,
      };

      const discountPercent = discountMap[member.membershipLevel] || 0;
      const discount = total * discountPercent;

      discountAmount = discount;
      total -= discount;
    }

    const estimationDaysMap = {
      regular: 3,
      express: 2,
      super_express: 1,
    };

    const estimationDays = estimationDaysMap[serviceType] || 3;
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(today.getDate() + estimationDays);

    const newOrder = new Order({
      orderCode,
      customerId: null,
      customerName,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      outletId,
      items: itemsWithSubtotal,
      total,
      discountAmount,
      discountCode: null,
      note,
      pickupDate,
      paymentType,
      paymentStatus: 'paid',
      serviceType,
      completedAt: estimatedCompletionDate,
      expireAt: null,
      cashierId: processedBy,
    });

    const savedOrder = await newOrder.save();

    const invoiceNumber = 'INV-' + crypto.createHash('md5')
      .update(`${savedOrder._id}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .slice(0, 12);

    await new Payment({
      orderId: savedOrder._id,
      invoiceNumber,
      amountPaid: total,
      paymentType,
      paymentStatus: 'paid',
      paidAt: new Date(),
      processedBy,
    }).save();

    await new Tracking({
      orderId: savedOrder._id,
      logs: [{ status: 'Order Created', timestamp: new Date() }],
    }).save();

    return await Order.findById(savedOrder._id)
      .populate('outletId')
      .populate('items.productId');
  } catch (error) {
    console.log(`err : ${error}`);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Terjadi kesalahan saat membuat order');
  }
};


const calculateTotal = async (items, serviceType = 'regular', memberCode = null) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Order harus memiliki minimal satu item');
  }

  // Ambil semua produk berdasarkan ID di items
  const productIds = items.map(item => item.id);
  const products = await Product.find({ _id: { $in: productIds } });

  // Gabungkan data items dengan data produk (price & unit)
  const itemsWithPrice = items.map(item => {
    const product = products.find(p => p._id.toString() === item.id);
    if (!product) {
      throw new Error(`Produk dengan ID ${item.id} tidak ditemukan`);
    }

    return {
      quantity: item.quantity,
      price: product.price,
      unit: product.unit
    };
  });

  // Hitung subtotal
  const subtotal = itemsWithPrice.reduce((acc, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return acc + (quantity * price);
  }, 0);

  // Tambah service fee
  let serviceFee = 0;
  if (serviceType === 'express') serviceFee = 5000;
  else if (serviceType === 'super_express') serviceFee = 10000;

  let total = subtotal + serviceFee;

  // Inisialisasi diskon
  let discountPercent = 0;

  if (memberCode) {
    const member = await Member.findOne({ memberNumber: memberCode });
    if (member) {
      switch (member.membershipLevel) {
        case 'silver': discountPercent = 0.05; break;
        case 'gold': discountPercent = 0.10; break;
        case 'platinum': discountPercent = 0.15; break;
      }
    }
  }

  // Hitung total akhir setelah diskon
  total -= total * discountPercent;

  return total;
};



const getOrderByIdService = async (id) => {
  try {
    const order = await Order.findById(id).populate('items.productId');
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order tidak ditemukan');
    return order;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Gagal mengambil order');
  }
};

// GET ALL BY OUTLET (sudah ada try-catch)
const getAllOrdersByOutletService = async (page = 1, limit = 10, outletId) => {
  try {
    const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });
    const filter = { outletId };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .populate({
        path: 'customerId',
        match: { $ne: null }  // populate hanya jika customerId tidak null
      })
      .populate('outletId')
      .populate('items.productId');


    const totalCount = await Order.countDocuments(filter);

    // Map untuk mengganti customerName/Phone jika null
    const formattedOrders = orders.map(order => {
      const customer = order.customerId;

      return {
        ...order.toObject(),
        customerName: order.customerName || customer?.username || null,
        customerPhone: order.customerPhone || customer?.phone || null,
      };
    });

    return {
      orders: formattedOrders,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      },
    };
  } catch (error) {
    console.log(`error : ${error}`);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch orders by outlet'
    );
  }
};



const getAllOrdersService = async (page = 1, limit = 10) => {
  try {
    const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .populate({
        path: 'customerId',
        match: { $ne: null }  // populate hanya jika customerId tidak null
      })
      .populate('outletId')
      .populate('items.productId');
    const totalCount = await Order.countDocuments();

    return {
      orders,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      },
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch all orders');
  }
};


const updateOrderStatusBasedOnPaymentServices = async (transactionId, paymentStatus) => {
  try {
    const allowedPaymentStatus = ['unpaid', 'paid'];

    if (!allowedPaymentStatus.includes(paymentStatus)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Status pembayaran tidak valid');
    }

    const order = await Order.findOne({ transactionId });
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order berdasarkan transaksi tidak ditemukan');
    }

    // Update payment status dan status order
    order.paymentStatus = paymentStatus;
    order.status = 'in_progress';

    // Jika sudah dibayar dan belum ada nomor antrian, generate nomor antrian
    if (paymentStatus === 'paid' && !order.queueNumber) {
      const nextQueueNumber = await generateQueueNumber(order.outletId);
      order.queueNumber = nextQueueNumber;
    }

    await order.save();

    // Populate detail order untuk dikembalikan
    const updatedOrder = await Order.findById(order._id)
      .populate('customerId')
      .populate('outletId')
      .populate('items.productId')
      .populate('discountId');

    return updatedOrder;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || 'Gagal memperbarui status pembayaran dan nomor antrian'
    );
  }
};


// CANCEL ORDER
const cancelOrderServices = async (id) => {
  try {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order tidak ditemukan');

    if (order.status !== 'pending') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Hanya order dengan status pending yang bisa dibatalkan');
    }

    await order.deleteOne();
    return order;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Gagal membatalkan order');
  }
};


const filterOrderByPriceAndOutletService = async (outletId, status, page = 1, limit = 10) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });
  try {
    if (!outletId) throw new Error('Outlet ID wajib diisi');

    const sortOrder = (status === 'down') ? 1 : -1; // 1 = ascending (harga terendah), -1 = descending

    // Query: filter berdasarkan outletId, urutkan berdasarkan total harga, skip & limit untuk pagination
    const orders = await Order.find({ outletId })
      .sort({ total: sortOrder })
      .skip(skip)
      .limit(pageLimit)
      .exec();

    // Hitung total count berdasarkan outletId
    const totalCount = await Order.countDocuments({ outletId });

    return {
      orders,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      },
    };
  } catch (error) {
    throw new Error(error.message || 'Error saat filter order');
  }
};



const searchOrderByCustomerNameAndOutletService = async (searchTerm, outletId, page = 1, limit = 10) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new Error('Kata kunci pencarian wajib diisi');
    }
    if (!outletId || !mongoose.Types.ObjectId.isValid(outletId)) {
      throw new Error('OutletId tidak valid');
    }

    const regex = new RegExp(searchTerm, 'i');

    // Ambil dulu semua order dengan outletId yang customerId != null atau customerName match
    const ordersRaw = await Order.find({
      outletId: outletId,
      $or: [
        { customerId: { $ne: null } },
        { customerName: { $regex: regex } }
      ]
    })
      .populate({
        path: 'customerId',
        select: 'username email',
        match: {
          $or: [
            { username: { $regex: regex } },
            { email: { $regex: regex } },
          ]
        }
      })
      .exec();

    // Filter sesuai customerId populated yang cocok, atau customerName cocok
    const filteredOrders = ordersRaw.filter(order => {
      if (order.customerId) return true;
      return order.customerName && regex.test(order.customerName);
    });

    // Hitung total count hasil filter
    const totalCount = filteredOrders.length;

    // Terapkan pagination di JS (karena sudah filter di JS)
    const paginatedOrders = filteredOrders.slice(skip, skip + pageLimit);

    return {
      orders: paginatedOrders,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      }
    };

  } catch (error) {
    throw new Error(error.message || 'Terjadi kesalahan saat pencarian order');
  }
};





module.exports = {
  createOrderByCashierService,
  createOrderByUserService,
  calculateTotal,
  getAllOrdersByOutletService,
  getAllOrdersService,
  getOrderByIdService,
  cancelOrderServices,
  updateOrderStatusBasedOnPaymentServices,
  filterOrderByPriceAndOutletService,
  searchOrderByCustomerNameAndOutletService
};
