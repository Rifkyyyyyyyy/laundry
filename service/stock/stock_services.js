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
    console.log(`error : ${error}`);
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
    console.log(`id : ${itemId} jumlah : ${jumlah}`);

    if (typeof jumlah !== 'number' || isNaN(jumlah)) {
      throw new ApiError(400, 'Jumlah harus berupa angka valid');
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      throw new ApiError(404, 'Item tidak ditemukan');
    }

    // Ganti stok lama dengan jumlah baru langsung
    item.stock = jumlah < 0 ? 0 : jumlah;

    await item.save();

    const updatedItem = await item.populate([
      { path: 'outletId', select: 'name address' },
      { path: 'createdBy', select: 'username email' }
    ]);

    return updatedItem;
  } catch (error) {
    console.log(`error : ${error}`);
    throw error;
  }
};



const deleteStockById = async (id) => {
  try {
    if (!id) {
      throw new ApiError(400, 'ID item wajib diberikan');
    }

    const deletedItem = await InventoryItem.findByIdAndDelete(id)
      .populate('outletId', 'name address')
      .populate('createdBy', 'username email');

    if (!deletedItem) {
      throw new ApiError(404, 'Item tidak ditemukan');
    }

    return deletedItem;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || 'Terjadi kesalahan saat menghapus item');
  }
};



module.exports = {
  addInventoryService,
  getAllInventoryForOutletId,
  getAllStockForAllOutlet,
  updateStockService,
  deleteStockById
};
