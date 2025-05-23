const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Discount = require('../../model/discounts/discount');
const { getPagination } = require('../../utils/func');

const createDiscountForOutletService = async (
  code,
  discountAmount,
  validFrom,
  validUntil,
  applicableProductIds,
  outletId,
  maxUsage
) => {
  const now = new Date();

  // Validasi: discountAmount harus antara 1 dan 100 (persen)
  if (
    typeof discountAmount !== 'number' ||
    discountAmount < 1 ||
    discountAmount > 100
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Nilai diskon harus berupa persentase antara 1 hingga 100.'
    );
  }

  const start = new Date(validFrom);
  const end = new Date(validUntil);

  // Validasi: Tanggal mulai dan akhir tidak boleh sama
  if (start.getTime() === end.getTime()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Tanggal mulai dan tanggal akhir tidak boleh sama.'
    );
  }

  // Validasi: Tanggal mulai dan akhir tidak boleh di masa lalu
  if (start < now || end < now) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Tanggal mulai dan tanggal akhir tidak boleh lebih awal dari hari ini.'
    );
  }

  // Cek apakah kode diskon sudah ada
  const existingDiscount = await Discount.findOne({ code });
  if (existingDiscount) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Kode diskon sudah digunakan. Silakan gunakan kode lain.'
    );
  }

  const data = {
    code,
    discountAmount,
    validFrom: start,
    validUntil: end,
    applicableProductIds,
    outlet: outletId,
    maxUsage,
    usageCount: 0,
    status: 'active',
  };

  try {
    const discount = new Discount(data);
    await discount.save();
    return discount;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Terjadi kesalahan saat menyimpan diskon: ' + error.message
    );
  }
};



// DELETE DISCOUNT
const deleteDiscountForOutletService = async (discountId, outletId) => {
  try {
    const discount = await Discount.findOneAndDelete({ _id: discountId, outlet: outletId });
    if (!discount) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Discount not found for this outlet');
    }
    return discount;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};

// UPDATE DISCOUNT
const updateDiscountForOutletService = async (discountId, outletId, updateData) => {
  try {
    const discount = await Discount.findOneAndUpdate(
      { _id: discountId, outlet: outletId },
      updateData,
      { new: true }
    );

    if (!discount) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Discount not found for this outlet');
    }

    return discount;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};

// GET ALL DISCOUNTS FOR AN OUTLET (with pagination)
const getDiscountsForOutletService = async (outletId, page = 1, limit = 5) => {
  try {
    const { skip, limit: pageLimit } = getPagination({ page, limit });

    const discounts = await Discount.find({ outlet: outletId })
      .skip(skip)
      .limit(pageLimit)
      .populate('applicableProductIds', 'name pricePerKg') // Populate nama & harga produk
      .sort({ createdAt: -1 });

    const total = await Discount.countDocuments({ outlet: outletId });

    return {
      discounts,
      pagination: {
        total,
        page,
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit),
      },
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};

// GET ALL DISCOUNTS (global) (with pagination)
const getAllDiscountService = async (page = 1, limit = 5) => {
  try {
    const { skip, limit: pageLimit } = getPagination({ page, limit });

    const discounts = await Discount.find()
      .skip(skip)
      .limit(pageLimit)
      .populate('outlet', 'name address') // Populate nama dan alamat outlet
      .populate('applicableProductIds', 'name pricePerKg') // Populate nama dan harga produk
      .sort({ createdAt: -1 });

    const total = await Discount.countDocuments();

    return {
      discounts,
      pagination: {
        total,
        page,
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit),
      },
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createDiscountForOutletService,
  deleteDiscountForOutletService,
  updateDiscountForOutletService,
  getDiscountsForOutletService,
  getAllDiscountService,
};
