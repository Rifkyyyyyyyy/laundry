const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  createProductService,
  getProductByIdService,
  getProductsByCategoryService,
  getProductsByOutletIdService,
  deleteProductService,
  updateProductService,
  searchProductsService,
  getAllProductsService,
  getSimpleProductsByOutletIdService ,
  getSimpleProductsService
} = require('../../service/product/product');
const { formatImageToBase64 } = require('../../utils/func');

// CREATE PRODUCT
const createProductController = catchAsync(async (req, res) => {
  const { name, price, unit, category, outletId, description } = req.body;
  const image = req.files?.image;

  let formattedImage = null;
  if (image) {
    formattedImage = formatImageToBase64(image);
  }


  const newProduct = await createProductService(name, category, Number(price), unit, outletId, formattedImage, description);

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Product successfully created',
    data: newProduct
  });
});

// GET PRODUCT BY ID
const getProductByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await getProductByIdService(id);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Product found',
    data: product
  });
});


const getAllProductByOutletController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const product = await getSimpleProductsByOutletIdService(outletId)
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Product found',
    data: product
  });
});

const getAllProductController = catchAsync(async (req, res) => {
  const product = await getSimpleProductsService();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Product found',
    data: product
  });
});


// GET PRODUCTS BY CATEGORY
const getProductsByCategoryController = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const products = await getProductsByCategoryService(categoryId);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Products by category retrieved successfully',
    data: products
  });
});

// GET ALL PRODUCTS WITH PAGINATION
const getAllProductsController = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  const data = await getAllProductsService(page, limit);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All products retrieved successfully',
    data: data,
  });
});

// GET PRODUCTS BY OUTLET ID WITH PAGINATION
const getProductsByOutletIdController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const data = await getProductsByOutletIdService(outletId, page, limit);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Products by outlet retrieved successfully',
    data: data
  });
});

// SEARCH PRODUCTS
const searchProductsController = catchAsync(async (req, res) => {
  const { query } = req.query;
  const products = await searchProductsService(query);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Products found matching search criteria',
    data: products
  });
});

// DELETE PRODUCT
const deleteProductController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await deleteProductService(id);
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'Product successfully deleted',
    data: null
  });
});

// UPDATE PRODUCT
const updateProductController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, unit, category } = req.body;
  const image = req.files?.image;

  const updatedProduct = await updateProductService(id, {
    name,
    description,
    price: price !== undefined ? Number(price) : undefined,
    unit,

    category,
    image
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
  updateProductController,
  getProductsByOutletIdController ,
  getAllProductByOutletController ,
  getAllProductController
};
