const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  createDiscountForOutletService,
  deleteDiscountForOutletService,
  updateDiscountForOutletService,
  getAllDiscountService,
  getDiscountsForOutletService
} = require('../../service/discount/discount_service');

// 1. Create Discount
const createDiscountByOutletController = catchAsync(async (req, res) => {
  const {
    outletId,
    code,
    discountAmount,
    validFrom,
    validUntil,
    applicableProductIds,
    maxUsage
  } = req.body;

  const newDiscount = await createDiscountForOutletService(
    code,
    discountAmount,
    validFrom,
    validUntil,
    applicableProductIds,
    outletId,
    maxUsage
  );

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Diskon berhasil dibuat',
    data: newDiscount
  });
});

// 2. Get All Discounts (admin)
const getAllDiscountController = catchAsync(async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const discounts = await getAllDiscountService(Number(page), Number(limit));

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Semua diskon berhasil diambil',
    data: discounts
  });
});

// 3. Get Discounts by Outlet
const getDiscountsByOutletController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { page = 1, limit = 5 } = req.query;

  const discounts = await getDiscountsForOutletService(outletId, Number(page), Number(limit));

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Diskon untuk outlet ${outletId} berhasil diambil`,
    data: discounts
  });
});

// 4. Update Discount
const updateDiscountController = catchAsync(async (req, res) => {
  const { discountId } = req.params;
  const { outletId, ...updateData } = req.body;

  const updatedDiscount = await updateDiscountForOutletService(discountId, outletId, updateData);

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Diskon ${discountId} berhasil diperbarui`,
    data: updatedDiscount
  });
});

// 5. Delete Discount
const deleteDiscountController = catchAsync(async (req, res) => {
  const { discountId } = req.params;
  const { outletId } = req.body;

  await deleteDiscountForOutletService(discountId, outletId);

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Diskon ${discountId} berhasil dihapus`
  });
});

module.exports = {
  createDiscountByOutletController,
  getAllDiscountController,
  getDiscountsByOutletController,
  updateDiscountController,
  deleteDiscountController
};
