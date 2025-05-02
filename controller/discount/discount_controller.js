
// controllers/discount_controller.js
const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  createDiscount,
  getAllDiscounts,
  getActiveDiscounts,
  getDiscountByCode,
  updateDiscount,
  deleteDiscount,
  validateDiscount
} = require('../../service/discount/discount_service');

const createDiscountController = catchAsync(async (req, res) => {
  const newDiscount = await createDiscount(req.body);
  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Discount successfully created',
    data: newDiscount
  });
});

const getAllDiscountsController = catchAsync(async (req, res) => {
  const discounts = await getAllDiscounts();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All discounts retrieved successfully',
    data: discounts
  });
});

const getActiveDiscountsController = catchAsync(async (req, res) => {
  const discounts = await getActiveDiscounts();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Active discounts retrieved successfully',
    data: discounts
  });
});

const getDiscountByCodeController = catchAsync(async (req, res) => {
  const { code } = req.params;
  const discount = await getDiscountByCode(code);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Discount found',
    data: discount
  });
});

const updateDiscountController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedDiscount = await updateDiscount(id, req.body);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Discount successfully updated',
    data: updatedDiscount
  });
});

const deleteDiscountController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await deleteDiscount(id);
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'Discount successfully deleted',
    data: null
  });
});

const validateDiscountController = catchAsync(async (req, res) => {
  const { code, productId } = req.params;
  const discount = await validateDiscount(code, productId);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Discount validated successfully',
    data: discount
  });
});

module.exports = {
  createDiscountController,
  getAllDiscountsController,
  getActiveDiscountsController,
  getDiscountByCodeController,
  updateDiscountController,
  deleteDiscountController,
  validateDiscountController
};
