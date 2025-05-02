const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getProductById,
  getProductsByCategory,
  createProduct,
  deleteProduct,
  getAllProducts,
  searchProducts,
  updateProduct
} = require('../../service/product/product');

// CREATE PRODUCT
const createProductController = catchAsync(async (req, res) => {
  const { name, description, pricePerKg, estimation, category, outletId } = req.body;

  const newProduct = await createProduct({
    name,
    description,
    pricePerKg,
    estimation,
    category,
    outletId
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Product successfully created',
    data: newProduct
  });
});

// GET PRODUCT BY ID
const getProductByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await getProductById(id);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Product found',
    data: product
  });
});

// GET PRODUCTS BY CATEGORY
const getProductsByCategoryController = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const products = await getProductsByCategory(categoryId);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Products by category retrieved successfully',
    data: products
  });
});

// GET ALL PRODUCTS
const getAllProductsController = catchAsync(async (req, res) => {
  const products = await getAllProducts();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All products retrieved successfully',
    data: products
  });
});

// SEARCH PRODUCTS
const searchProductsController = catchAsync(async (req, res) => {
  const { query } = req.query;
  const products = await searchProducts(query);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Products found matching search criteria',
    data: products
  });
});

// DELETE PRODUCT
const deleteProductController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await deleteProduct(id);
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'Product successfully deleted',
    data: null
  });
});

// UPDATE PRODUCT
const updateProductController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, pricePerKg, estimation, category, outletId } = req.body;

  const updatedProduct = await updateProduct(id, {
    name,
    description,
    pricePerKg,
    estimation,
    category,
    outletId
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Product successfully updated',
    data: updatedProduct
  });
});

module.exports = {
  createProductController,
  getProductByIdController,
  getProductsByCategoryController,
  getAllProductsController,
  searchProductsController,
  deleteProductController,
  updateProductController
};
