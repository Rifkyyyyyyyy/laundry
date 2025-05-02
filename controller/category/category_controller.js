const {
    createCategory,
    getActiveCategories,
    getAllCategories,
    getCategoryById,
    deleteCategory,
    updateCategory,
} = require('../../service/category/category_service');
const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');

// CREATE CATEGORY
const createCategoryController = catchAsync(async (req, res) => {
    const { name, description, status } = req.body; // Destructuring req.body

    const newCategory = await createCategory({
        name,
        description,
        status
    });

    res.status(StatusCodes.CREATED).json({
        status: true,
        message: 'Category successfully created',
        data: newCategory
    });
});

// GET ACTIVE CATEGORIES
const getActiveCategoriesController = catchAsync(async (req, res) => {
    const categories = await getActiveCategories();
    res.status(StatusCodes.OK).json({
        status: true,
        message: 'Active categories retrieved successfully',
        data: categories
    });
});

// GET ALL CATEGORIES
const getAllCategoriesController = catchAsync(async (req, res) => {
    const categories = await getAllCategories();
    res.status(StatusCodes.OK).json({
        status: true,
        message: 'All categories retrieved successfully',
        data: categories
    });
});

// GET CATEGORY BY ID
const getCategoryByIdController = catchAsync(async (req, res) => {
    const { id } = req.params;
    const category = await getCategoryById(id);
    res.status(StatusCodes.OK).json({
        status: true,
        message: 'Category found',
        data: category
    });
});

// DELETE CATEGORY
const deleteCategoryController = catchAsync(async (req, res) => {
    const { id } = req.params;
    await deleteCategory(id);
    res.status(StatusCodes.NO_CONTENT).json({
        status: true,
        message: 'Category successfully deleted',
        data: null
    });
});

// UPDATE CATEGORY
const updateCategoryController = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body; // Destructuring req.body

    const updatedCategory = await updateCategory(id, {
        name,
        description,
        status
    });

    res.status(StatusCodes.OK).json({
        status: true,
        message: 'Category successfully updated',
        data: updatedCategory
    });
});

module.exports = {
    createCategoryController,
    getActiveCategoriesController,
    getAllCategoriesController,
    getCategoryByIdController,
    deleteCategoryController,
    updateCategoryController
};
