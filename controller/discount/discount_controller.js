const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  createDiscountForOutletService,
  deleteDiscount,
  updateDiscount,
  getAllDiscountService,
  getDiscountsForOutletService
} = require('../../service/discount/discount_service');

// 1. Create Discount
const createDiscountByOutletController = catchAsync(async (req, res) => {
  console.log(`body : ${JSON.stringify(req.body)}`);
  const { 
    code,
    discountAmount,
    validFrom,
    validUntil,
    applicableProductIds,
    maxUsage
  } = req.body;

  const discountAmountNum = Number(discountAmount);
  if (isNaN(discountAmountNum)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: 'discountAmount harus berupa angka yang valid'
    });
  }

  // Pastikan outletId diteruskan ke service, karena di service createDiscountForOutletService
  // kamu perlu outletIds untuk simpan di discount
  const newDiscount = await createDiscountForOutletService(
    code,
    discountAmountNum,
    validFrom,
    validUntil,
    applicableProductIds,
    maxUsage,
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
  const updateData = req.body;

  // Perhatikan service updateDiscount hanya menerima discountId dan updateData
  const updatedDiscount = await updateDiscount(discountId, updateData);

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Diskon ${discountId} berhasil diperbarui`,
    data: updatedDiscount
  });
});

// 5. Delete Discount
const deleteDiscountController = catchAsync(async (req, res) => {
  const { discountId } = req.params;

  await deleteDiscount(discountId);

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
