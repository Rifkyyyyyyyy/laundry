const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Discount = require('../../model/discount/discount');

const createDiscount = async (data) => {
  if (new Date(data.validFrom) >= new Date(data.validUntil)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Tanggal mulai harus lebih awal dari tanggal berakhir');
  }

  const existing = await Discount.findOne({ code: data.code });
  if (existing) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Kode diskon sudah digunakan');
  }

  const discount = new Discount(data);
  return await discount.save();
};

const getAllDiscounts = async () => {
  return await Discount.find();
};

const getActiveDiscounts = async () => {
  const now = new Date();
  return await Discount.find({
    status: 'active',
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  });
};

const getDiscountByCode = async (code) => {
  const discount = await Discount.findOne({ code });
  if (!discount) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Diskon tidak ditemukan');
  }
  return discount;
};

const updateDiscount = async (id, data) => {
  if (data.validFrom && data.validUntil && new Date(data.validFrom) >= new Date(data.validUntil)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Tanggal mulai harus lebih awal dari tanggal berakhir');
  }

  if (data.code) {
    const existing = await Discount.findOne({ code: data.code, _id: { $ne: id } });
    if (existing) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Kode diskon sudah digunakan');
    }
  }

  const updated = await Discount.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!updated) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Diskon tidak ditemukan untuk diperbarui');
  }

  return updated;
};

const deleteDiscount = async (id) => {
  const deleted = await Discount.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Diskon tidak ditemukan');
  }
  return deleted;
};

const validateDiscount = async (code, productId = null) => {
  const now = new Date();
  const discount = await Discount.findOne({
    code,
    status: 'active',
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  });

  if (!discount) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Diskon tidak valid atau sudah kedaluwarsa');
  }

  if (discount.maxUsage && discount.usageCount >= discount.maxUsage) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Diskon sudah mencapai batas penggunaan');
  }

  if (productId && discount.applicableProductIds?.length > 0) {
    const isAllowed = discount.applicableProductIds.map(p => p.toString()).includes(productId.toString());
    if (!isAllowed) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Diskon tidak berlaku untuk produk ini');
    }
  }

  discount.usageCount += 1;
  await discount.save();

  return discount;
};

module.exports = {
  createDiscount,
  getAllDiscounts,
  getActiveDiscounts,
  getDiscountByCode,
  updateDiscount,
  deleteDiscount,
  validateDiscount
};
