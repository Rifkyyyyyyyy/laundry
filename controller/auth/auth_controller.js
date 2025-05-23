const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const { loginUserService, registerUserService, updateUserService } = require('../../service/auth/auth_service');
const { formatImageToBase64 } = require('../../utils/func');

// Register user (Kasir or Customer)
const registerController = catchAsync(async (req, res) => {
  const { email, username, password, role, outletId } = req.body;
  const image = req.files?.image;

  let formattedImage = null;
  if (image) {
    formattedImage = formatImageToBase64(image);
  }

  if (!email || !username || !password || !role) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: 'Email, username, password, and role are required'
    });
  }

  // Register a new user (Kasir or Customer)
  const newUser = await registerUserService({
    email, username, password, role, outletId, image: formattedImage
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'User successfully registered',
    data: newUser
  });
});

// Login user (Owner, Kasir, or Customer)
const loginController = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: 'Email and password are required'
    });
  }

  // Authenticate user
  const user = await loginUserService(email, password);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Login successful',
    data: user
  });
});

// Update user
const updateUserController = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { email, username, password } = req.body;
  const image = req.files?.image;  // Mengambil file gambar dari request

  if (!userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: 'UserId is required'
    });
  }

  // Update user details
  const updatedUser = await updateUserService(userId, email, username, password, image);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'User successfully updated',
    data: updatedUser
  });
});

module.exports = {
  registerController,
  loginController,
  updateUserController
};
