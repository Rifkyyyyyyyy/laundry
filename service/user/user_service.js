const User = require('../../model/user/user');
const File = require('../../model/file/file');
const ApiError = require('../../utils/apiError');
const { StatusCodes } = require('http-status-codes');
const { getPagination, generateMD5Hash } = require('../../utils/func');

const {
  handleImageDestroys,
  handleImageUpload
} = require('../cloudinary/cloudinary');


const updateUserService = async (userId, email, username, password, image, address, lat, long) => {
  try {
    const user = await User.findById(userId).populate('photo');
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Cek & update email jika berubah
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already in use');
      }
      user.email = email;
    }

    // Cek & update username jika berubah
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Username already in use');
      }
      user.username = username;
    }

    // 🔒 Cegah update role & outletId
    if ('role' in user || 'outletId' in user) {
      if (user.role !== user._doc.role || String(user.outletId) !== String(user._doc.outletId)) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Role and OutletId cannot be updated');
      }
    }

    // Update password jika ada
    if (password) {
      user.password = generateMD5Hash(password);
    }

    // Update foto jika ada
    if (image) {
      if (user.photo) {
        await handleImageDestroys(user.photo.public_id);
      }
      const fileId = await handleImageUpload('users', image);
      user.photo = fileId;
    }

    // Update address, lat, long jika ada
    if (address || lat || long) {
      user.address = {
        address: address || user.address?.address || '',
        lat: lat !== undefined ? lat : user.address?.lat,
        lng: long !== undefined ? long : user.address?.lng
      };
    }

    await user.save();
    return user;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};



const deleteUserService = async (userId) => {
  try {
    const user = await User.findById(userId).populate('photo');
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.photo) {
      await handleImageDestroys(user.photo.public_id);
      await File.findByIdAndDelete(user.photo._id);
    }

    await user.deleteOne();
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};



const getCashierService = async (page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    const cashiers = await User.find({ role: 'kasir' })
      .skip(skip)
      .limit(pageLimit)
      .populate('outletId')
      .populate('photo')
      .select('-password');

    const totalCount = await User.countDocuments({ role: 'kasir' });

    return {
      cashiers,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Terjadi kesalahan saat mengambil data kasir');
  }
};


const getAllCustomerService = async (page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    const customers = await User.find({ role: 'customer' })
      .skip(skip)
      .limit(pageLimit)
      .populate('photo')
      .select('-password');

    const totalCount = await User.countDocuments({ role: 'customer' });

    return {
      customers,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Terjadi kesalahan saat mengambil data customer');
  }
};

const searchCustomerService = async (searchTerm, page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    const query = {
      role: 'customer',
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const customers = await User.find(query)
      .skip(skip)
      .limit(pageLimit)
      .populate('photo', 'url') // hanya ambil field `url` dari photo
      .select('-password');

    const totalCount = await User.countDocuments(query);

    return {
      customers,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Gagal mencari customer');
  }
};


module.exports = {
  updateUserService,
  deleteUserService,
  getCashierService,
  getAllCustomerService,
  searchCustomerService
};
