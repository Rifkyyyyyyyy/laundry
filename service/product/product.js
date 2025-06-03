const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Product = require('../../model/product/product');
const Discount = require('../../model/discounts/discount')
const { getPagination } = require('../../utils/func');
const { handleImageUpload, handleImageDestroys } = require('../cloudinary/cloudinary');

const createProductService = async (name, category, price, unit, outletId, image, description) => {
  try {
    if (!name || !category || price === undefined || !unit || !outletId || !image) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Nama, kategori, harga, unit, outlet, dan foto wajib diisi');
    }

    if (!['kg', 'item'].includes(unit)) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Unit harus "kg" atau "item"');
    }

    if (typeof price !== 'number' || price < 0) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Harga harus angka positif');
    }

    const existing = await Product.findOne({ name });
    if (existing) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Nama produk sudah digunakan');
    }

    const photoId = await handleImageUpload('products', image);

    const newProduct = await Product.create({
      name,
      price,
      unit,
      category,
      description,
      outletId,
      photo: photoId,
    });

    // Ambil ulang produk yang baru dibuat dengan populate
    const populatedProduct = await Product.findById(newProduct._id)
      .populate('category')
      .populate('outletId')
      .populate('photo');

    return populatedProduct;
  } catch (error) {
    console.log(`error : ${error}`);
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error?.message || 'Gagal membuat produk');
  }
};


const updateProductService = async (productId, { name, price, unit, category, image, description }) => {
  try {
    const product = await Product.findById(productId).populate('photo');
    if (!product) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan untuk diperbarui');
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Harga harus angka positif');
      }
      product.price = price;
    }
    if (unit) {
      if (!['kg', 'item'].includes(unit)) {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Unit harus "kg" atau "item"');
      }
      product.unit = unit;
    }
    if (category) product.category = category;

    if (image) {
      if (product.photo?._id) {
        await handleImageDestroys(product.photo._id);
      }
      product.photo = await handleImageUpload('products', image);
    }

    return await product.save();
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error?.message || 'Gagal memperbarui produk');
  }
};



const getAllProductsService = async (page = 1, limit = 10) => {
  try {
    const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

    const products = await Product.find()
      .skip(skip)
      .limit(pageLimit)
      .populate('category')
      .populate('outletId')
      .populate('photo');

    const totalCount = await Product.countDocuments();

    return {
      products,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      },
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error?.message || 'Gagal mengambil produk');
  }
};

const getProductByIdService = async (id) => {
  try {
    const product = await Product.findById(id)
      .populate('category')
      .populate('outletId')
      .populate('photo');

    if (!product) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan');
    }

    return product;
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error?.message || 'Gagal mengambil produk');
  }
};

const deleteProductService = async (id) => {
  try {
    const product = await Product.findById(id).populate('photo');
    if (!product) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan');
    }

    // Hapus foto produk kalau ada
    if (product.photo?._id) {
      await handleImageDestroys(product.photo._id);
    }

    // Update diskon agar produk ini tidak lagi ada di applicableProductIds
    await Discount.updateMany(
      { applicableProductIds: id },
      { $pull: { applicableProductIds: id } }
    );

    // Hapus produk
    await Product.findByIdAndDelete(id);

    return product;
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error?.message || 'Gagal menghapus produk');
  }
};

const getProductsByCategoryService = async (categoryId) => {
  try {
    return await Product.find({ category: categoryId })
      .populate('category')
      .populate('outletId')
      .populate('photo');
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error?.message || 'Gagal mengambil produk berdasarkan kategori');
  }
};

const searchProductsService = async (keyword) => {
  try {
    return await Product.find({
      name: { $regex: keyword, $options: 'i' },
    })
      .populate('category')
      .populate('outletId')
      .populate('photo');
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error?.message || 'Gagal mencari produk');
  }
};

const getProductsByOutletIdService = async (outletId, page = 1, limit = 10) => {
  try {
    const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

    const products = await Product.find({ outletId })
      .skip(skip)
      .limit(pageLimit)
      .populate('category')
      .populate('outletId')
      .populate('photo');

    const totalCount = await Product.countDocuments({ outletId });

    if (products.length === 0) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan untuk outlet ini');
    }

    return {
      products,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      },
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error?.message || 'Gagal mengambil produk berdasarkan outlet');
  }
};

const getSimpleProductsByOutletIdService = async (outletId) => {
  try {
    const products = await Product.find({ outletId })
      .select('name price productId photo') // ambil hanya field yang dibutuhkan
      .populate({
        path: 'photo',
        select: 'url' // ambil hanya URL dari relasi photo
      });

    if (products.length === 0) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Produk tidak ditemukan untuk outlet ini');
    }

    const mappedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price : product.price,
      url: product.photo ? product.photo.url : null,
    }));

    return mappedProducts;
  } catch (error) {
    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      error?.message || 'Gagal mengambil produk berdasarkan outlet'
    );
  }
};


const getSimpleProductsService = async () => {
  try {
    const products = await Product.find()
      .select('name price outletId photo') // tambahkan outletId
      .populate({
        path: 'photo',
        select: 'url'
      })
      .populate({
        path: 'outletId',
        select: 'name'
      });

    if (products.length === 0) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Tidak ada produk ditemukan');
    }

    const mappedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price,
      url: product.photo?.url || null,
      outletName: product.outletId?.name || null ,
    }));

    return mappedProducts;
  } catch (error) {
    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      error?.message || 'Gagal mengambil produk'
    );
  }
};




module.exports = {
  createProductService,
  updateProductService,
  getAllProductsService,
  getProductByIdService,
  deleteProductService,
  getProductsByCategoryService,
  searchProductsService,
  getProductsByOutletIdService,
  getSimpleProductsByOutletIdService ,
  getSimpleProductsService
};
