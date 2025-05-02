const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const { loginUser, registerUser } = require('../../service/auth/auth_service');

// Register user (Kasir or Customer)
const registerController = catchAsync(async (req, res) => {
  const { email, username, password, role, outletId } = req.body;

  // Register a new user (Kasir or Customer)
  const newUser = await registerUser({ email, username, password, role, outletId });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'User successfully registered',
    data: newUser
  });
});

// Login user (Owner, Kasir, or Customer)
const loginController = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Authenticate user
  const user = await loginUser(email, password);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Login successful',
    data: user
  });
});

module.exports = {
  registerController,
  loginController
};
