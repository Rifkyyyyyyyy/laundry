const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Product = require('../../model/product/product');

// CREATE PRODUCT
const createProduct = async (data) => {
  const { name, category, pricePerKg, estimation, outletId } = data;

  if (!name || !category || !pricePerKg || !estimation || !outletId) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Nama, kategori, harga, estimasi, dan outlet wajib diisi');
  }

  const existing = await Product.findOne({ name });
  if (existing) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Nama produk sudah digunakan');
  }

  const newProduct = new Product(data);
  return await newProduct.save();
};

// GET ALL PRODUCTS
const getAllProducts = async () => {
  return await Product.find()
    .populate('category')
    .populate('outletId');
};

// GET PRODUCT BY ID
const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate('category')
    .populate('outletId');
  if (!product) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan');
  }
  return product;
};

// UPDATE PRODUCT
const updateProduct = async (id, data) => {
  const updated = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).populate('category')
    .populate('outletId');

  if (!updated) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan untuk diperbarui');
  }

  return updated;
};

// DELETE PRODUCT
const deleteProduct = async (id) => {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan');
  }
  return deleted;
};

// GET PRODUCTS BY CATEGORY
const getProductsByCategory = async (categoryId) => {
  return await Product.find({ category: categoryId })
    .populate('category')
    .populate('outletId');
};

// SEARCH PRODUCTS BY KEYWORD
const searchProducts = async (keyword) => {
  return await Product.find({
    name: { $regex: keyword, $options: 'i' }
  }).populate('category')
    .populate('outletId');
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts
};
