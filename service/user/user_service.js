const User = require('../../model/user/user');
const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const { getPagination } = require('../../utils/func');

// DELETE CASHIER SERVICE
const deleteCashierService = async (cashierId) => {
  try {
    const cashier = await User.findById(cashierId);
    if (!cashier) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Kasir tidak ditemukan');
    }

    if (cashier.role !== 'cashier') {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'User ini bukan kasir');
    }

    await cashier.deleteOne();
    return null;
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Terjadi kesalahan saat menghapus kasir');
  }
};

// GET CASHIER SERVICE (return data kasir beserta outlet yang mereka jaga)
const getCashierService = async (page = 1, limit = 10) => {
  const { skip, limitPage } = getPagination(page, limit);

  try {
    // Ambil semua kasir dengan pagination dan populate outlet yang mereka jaga
    const cashiers = await User.find({ role: 'kasir' })
      .skip(skip)
      .limit(limitPage)
      .populate('outletId')  // Pastikan outletId di User mengarah ke model Outlet
      .select('-password');  // Misalkan tidak perlu menampilkan password

    return cashiers;
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Terjadi kesalahan saat mengambil data kasir');
  }
};


const getAllCustomerService = async () => {
  const customers = await User.find({ role: 'customer' });
  return customers;
};

module.exports = {
  deleteCashierService,
  getCashierService,
  getAllCustomerService
};
