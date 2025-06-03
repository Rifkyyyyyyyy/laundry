const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getAllInventoryForOutletId,
  addInventoryService,
  updateStockService,
  getAllStockForAllOutlet,
} = require('../../service/stock/stock_services');


const addInventory = catchAsync(async (req, res) => {
  const {
    name,
    stock,
    satuan,
    outletId,
    createdBy,
    description,
    category,
    minStock,
    pricePerUnit,
  } = req.body;

  const newItem = await addInventoryService(
    name,
    Number(stock) || 0,
    satuan,
    outletId,
    createdBy,
    description,
    category,
    Number(minStock) || 0,
    Number(pricePerUnit) || 0
  );

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Item berhasil ditambahkan ke inventaris',
    data: newItem,
  });
});


const getInventoryByOutlet = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { page = 1, limit = 5 } = req.query;

  const result = await getAllInventoryForOutletId(outletId, parseInt(page), parseInt(limit));
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Data inventaris berhasil diambil',
    data: result
  });
});

const getAllInventory = catchAsync(async (req, res) => {
  const { page = 1, limit = 5 } = req.query;

  const result = await getAllStockForAllOutlet(parseInt(page), parseInt(limit));
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Data stok semua outlet berhasil diambil',
    data: result
  });
});

const updateStock = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const { jumlah } = req.body;

  // Pastikan jumlah diparse ke number
  const parsedJumlah = Number(jumlah);

  const updatedItem = await updateStockService(itemId, parsedJumlah);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Stok berhasil diperbarui',
    data: updatedItem,
  });
});


module.exports = {
  addInventory,
  getInventoryByOutlet,
  getAllInventory,
  updateStock,
};
