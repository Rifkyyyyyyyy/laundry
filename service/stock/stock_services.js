const InventoryItem = require('../../model/inventory/inventory');
const ApiError = require('../../utils/apiError');
const { getPagination } = require('../../utils/func');


const allowedCategories = ['Sabun', 'Plastik', 'Pewangi', 'Deterjen', 'Lainnya'];

const addInventoryService = async (
  name,
  stock = 0,
  satuan = 'pcs',
  outletId,
  createdBy,
  description = '',
  category = 'Lainnya',
  minStock = 0,
  pricePerUnit = 0
) => {
  try {
    if (!name || !outletId || !createdBy) {
      throw new ApiError(400, 'Field name, outletId, dan createdBy wajib diisi.');
    }

    if (!allowedCategories.includes(category)) {
      throw new ApiError(400, `Category "${category}" tidak valid. Pilih dari: ${allowedCategories.join(', ')}`);
    }

    const existingItem = await InventoryItem.findOne({ name, outletId });
    if (existingItem) {
      throw new ApiError(400, 'Item dengan nama tersebut sudah ada di outlet ini.');
    }

    const newItem = new InventoryItem({
      name,
      stock,
      satuan,
      outletId,
      createdBy,
      description,
      category,
      minStock,
      pricePerUnit,
    });

    await newItem.save();

    const populatedItem = await InventoryItem.findById(newItem._id)
      .populate('outletId', 'name address')
      .populate('createdBy', 'username email');

    return populatedItem;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || 'Terjadi kesalahan saat menambahkan inventory');
  }
};



const getAllInventoryForOutletId = async (outletId, page = 1, limit = 5) => {
  try {
    if (!outletId) throw new ApiError(400, 'OutletId wajib diberikan');

    const { skip, limit: pageLimit } = getPagination({ page, limit });

    const items = await InventoryItem.find({ outletId, isActive: true })
      .sort({ name: 1 })
      .skip(skip)
      .limit(pageLimit)
      .populate('outletId', 'name address')
      .populate('createdBy', 'username email');

    const totalItems = await InventoryItem.countDocuments({ outletId, isActive: true });

    return {
      stock: items,
      pagination: {

        page: page,
        limit: pageLimit,
        totalCount: totalItems,
        totalPages: Math.ceil(totalItems / pageLimit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getAllStockForAllOutlet = async (page = 1, limit = 5) => {
  try {
    const { skip, limit: pageLimit } = getPagination({ page, limit });

    const items = await InventoryItem.find({ isActive: true })
      .sort({ name: 1 })
      .skip(skip)
      .limit(pageLimit)
      .populate('outletId', 'name address')
      .populate('createdBy', 'username email');

    const totalItems = await InventoryItem.countDocuments({ isActive: true });

    return {
      stock: items,
      pagination: {

        page: page,
        limit: pageLimit,
        totalCount: totalItems,
        totalPages: Math.ceil(totalItems / pageLimit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const updateStockService = async (itemId, jumlah) => {
  try {
    if (typeof jumlah !== 'number' || isNaN(jumlah)) {
      throw new ApiError(400, 'Jumlah harus berupa angka valid');
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      throw new ApiError(404, 'Item tidak ditemukan');
    }

    item.stock += jumlah;

    if (item.stock < 0) {
      item.stock = 0;
    }

    await item.save();

    return await item.populate('outletId', 'name address')
      .populate('createdBy', 'username email');
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addInventoryService,
  getAllInventoryForOutletId,
  getAllStockForAllOutlet,
  updateStockService,
};
