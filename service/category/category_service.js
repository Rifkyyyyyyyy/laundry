const ApiError = require('../../utils/apiError');
const Category = require('../../model/category/category');

const { STATUS_CODES } = require('http');

const {
  handleImageUpload,
  handleImageDestroys
} = require('../cloudinary/cloudinary');

const createCategory = async ({ name, description, status = 'active', image }) => {
  try {
    const existing = await Category.findOne({ name });
    if (existing) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Kategori sudah ada');
    }
    const photoId = await handleImageUpload('categories', image);

    const category = new Category({
      name,
      description,
      status,
      photo: photoId
    });

    return await category.save();
  } catch (error) {
    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message || 'Gagal membuat category'
    );
  }
};

const updateCategory = async (id, name, description, status = 'active', image) => {
  try {
    const category = await Category.findById(id).populate('photo');
    if (!category) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Kategori tidak ditemukan');
    }

    if (name && name !== category.name) {
      const existing = await Category.findOne({ name, _id: { $ne: id } });
      if (existing) {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Nama kategori sudah digunakan');
      }
      category.name = name;
    }

    if (description) category.description = description;
    if (status) category.status = status;

    if (image) {
      if (category.photo?._id) {
        await handleImageDestroys(category.photo._id);
      }
      category.photo = await handleImageUpload('categories', image);
    }

    return await category.save();
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Gagal memperbarui kategori');
  }
};

const getAllCategories = async () => {
  try {
    return await Category.find().populate('photo');
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Gagal mengambil daftar kategori');
  }
};

const getCategoryById = async (id) => {
  try {
    const category = await Category.findById(id).populate('photo');
    if (!category) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Kategori tidak ditemukan');
    }
    return category;
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Gagal mengambil kategori');
  }
};

const deleteCategory = async (id) => {
  try {
    const category = await Category.findById(id).populate('photo');
    if (!category) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Kategori tidak ditemukan');
    }

    if (category.photo?._id) {
      await handleImageDestroys(category.photo._id);
    }

    return await Category.findByIdAndDelete(id);
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || 'Gagal menghapus kategori');
  }
};

const getActiveCategories = async () => {
  try {
    return await Category.find({ status: 'active' }).populate('photo');
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Gagal mengambil kategori aktif');
  }
};


const getAllNamePhotoCategories = async () => {
  try {
    // Cari semua kategori, pilih field _id, name, dan photo saja
    const categories = await Category.find({}, '_id name');

    return categories;
  } catch (error) {
    throw new Error(error.message || 'Gagal mengambil data kategori');
  }
};


module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getActiveCategories ,
  getAllNamePhotoCategories
};
