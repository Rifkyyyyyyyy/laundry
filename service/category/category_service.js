const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Category = require('../../model/category/category');

const createCategory = async (data) => {
    const existing = await Category.findOne({ name: data.name });
    if (existing) {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Kategori sudah ada');
    }
    const category = new Category(data);
    return await category.save();
};

const getAllCategories = async () => await Category.find();

const getCategoryById = async (id) => {
    const category = await Category.findById(id);
    if (!category) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Kategori tidak ditemukan');
    return category;
};

const updateCategory = async (id, data) => {
    if (data.name) {
        const existing = await Category.findOne({ name: data.name, _id: { $ne: id } });
        if (existing) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Nama kategori sudah digunakan');
        }
    }
    const updated = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Gagal update kategori');
    return updated;
};

const deleteCategory = async (id) => {
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Kategori tidak ditemukan');
    return deleted;
};

const getActiveCategories = async () => await Category.find({ status: 'active' });

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getActiveCategories
};
