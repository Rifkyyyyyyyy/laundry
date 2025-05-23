const User = require('../../model/user/user');
const ApiError = require('../../utils/apiError');
const { StatusCodes } = require('http-status-codes');
const { logSuccess } = require('../../utils/err');
const { generateMD5Hash } = require('../../utils/func');

const {
  handleImageUpload
} = require('../cloudinary/cloudinary');

const registerUserService = async ({
  email, username, password, role, outletId, image
}) => {
  try {
    if (role === 'owner') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Owner cannot register through this API. Please add directly in the database.');
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email or username already in use');
    }

    if (role === 'kasir' && !outletId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Outlet ID is required for kasir');
    }

    const hashedPassword = generateMD5Hash(password);
    let fileId = null;

    if (image) {
      fileId = await handleImageUpload('users', image);
    }

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role,
      outletId: role === 'kasir' ? outletId : undefined,
      photo: fileId
    });

    await newUser.save();
    logSuccess(`User registered: ${username}`);
    return newUser;

  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const loginUserService = async (email, password) => {
  try {
    const hashedPassword = generateMD5Hash(password);

    let user = await User.findOne({ email, password: hashedPassword }).populate('photo');
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    if (user.role === 'kasir') {
      user = await user.populate({ path: 'outletId', select: 'name location' });
    }

    logSuccess(`User logged in: ${user.username}`);

    return {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      photo: user.photo ? { url: user.photo.url, public_id: user.photo.public_id } : null,
      ...(user.role === 'kasir' && { outlet: user.outletId })
    };

  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  registerUserService,
  loginUserService,
};
