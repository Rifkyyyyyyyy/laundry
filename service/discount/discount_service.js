const ApiError = require('../../utils/apiError');
const { StatusCodes } = require('http-status-codes');
const Discount = require('../../model/discounts/discount');
const Product = require('../../model/product/product'); // tambahkan ini
const { getPagination } = require('../../utils/func');

// CREATE DISCOUNT
const createDiscountForOutletService = async (
  code,
  discountAmount,
  validFrom,
  validUntil,
  applicableProductIds,
  maxUsage
) => {
  const now = new Date();

  console.log(`code : ${code} - amount : ${discountAmount} - valid : ${validFrom} until : ${validUntil} - produk : ${applicableProductIds} - usage : ${maxUsage}`);

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

  if (start.getTime() === end.getTime()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Tanggal mulai dan tanggal akhir tidak boleh sama.'
    );
  }

  if (start < now || end < now) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Tanggal mulai dan tanggal akhir tidak boleh lebih awal dari hari ini.'
    );
  }

  const existingDiscount = await Discount.findOne({ code });
  if (existingDiscount) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Kode diskon sudah digunakan. Silakan gunakan kode lain.'
    );
  }

  if (!applicableProductIds || applicableProductIds.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Setidaknya satu produk harus dipilih.'
    );
  }

  const products = await Product.find({
    _id: { $in: applicableProductIds }
  }).select('outletId');

  if (products.length !== applicableProductIds.length) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Beberapa produk tidak ditemukan.'
    );
  }

  const outletIds = [...new Set(products.map(p => String(p.outletId)))];

  const data = {
    code,
    discountAmount,
    validFrom: start,
    validUntil: end,
    applicableProductIds,
    outletIds,
    maxUsage,
    usageCount: 0,
    status: 'active',
  };

  try {
    const discount = new Discount(data);
    await discount.save();

    const populatedDiscount = await Discount.findById(discount._id)
      .populate({
        path: 'applicableProductIds',
        populate: {
          path: 'category photo outletId',
          select: 'name url',
        },
      })
      .populate('outletIds', 'name address');

    return populatedDiscount;
  } catch (error) {
    console.log(`error : ${error}`);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Terjadi kesalahan saat menyimpan diskon: ' + error.message
    );
  }
};

// DELETE DISCOUNT
const deleteDiscountForOutletService = async (discountId) => {
  try {
    const discount = await Discount.findByIdAndDelete(discountId);
    if (!discount) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Diskon tidak ditemukan');
    }
    return discount;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

// UPDATE DISCOUNT
const updateDiscountForOutletService = async (discountId, updateData) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      discountId,
      updateData,
      { new: true }
    )
      .populate('applicableProductIds')
      .populate('outletIds');

    if (!discount) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Diskon tidak ditemukan');
    }

    return discount;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

// GET DISCOUNTS BY OUTLET
const getDiscountsForOutletService = async (outletId, page = 1, limit = 5) => {
  try {
    const { skip, limit: pageLimit } = getPagination({ page, limit });

    const discounts = await Discount.find({ outletIds: outletId })
      .skip(skip)
      .limit(pageLimit)
      .populate({
        path: 'applicableProductIds',
        select: 'name price unit category photo',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'photo', select: 'url' },
        ],
      })
      .populate('outletIds', 'name')
      .sort({ createdAt: -1 });

    const total = await Discount.countDocuments({ outletIds: outletId });

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
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

// GET ALL DISCOUNTS
const getAllDiscountService = async (page = 1, limit = 5) => {
  try {
    const { skip, limit: pageLimit } = getPagination({ page, limit });

    const discounts = await Discount.find()
      .skip(skip)
      .limit(pageLimit)
      .populate('outletIds', 'name address')
      .populate('applicableProductIds', 'name pricePerKg')
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
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createDiscountForOutletService,
  deleteDiscountForOutletService,
  updateDiscountForOutletService,
  getDiscountsForOutletService,
  getAllDiscountService,
};
