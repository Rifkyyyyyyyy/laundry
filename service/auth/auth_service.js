const User = require('../../model/user/user');
const ApiError = require('../../utils/apiError');
const { StatusCodes } = require('http-status-codes');
const { logSuccess } = require('../../utils/err');
const { generateMD5Hash } = require('../../utils/func');

// Register user (Kasir or Customer)
const registerUser = async (data) => {
  const { email, username, password, role, outletId } = data;

  // Owner tidak bisa registrasi melalui API ini
  if (role === 'owner') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Owner cannot register through this API. Please add directly in the database.');
  }

  // Check if email or username already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email or username already in use');
  }

  // If the user is kasir, outletId must be provided
  if (role === 'kasir' && !outletId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OutletId is required for kasir');
  }

  // Encrypt the password using MD5 (for dummy login without sessions/JWT)
  const hashedPassword = generateMD5Hash(password);

  const newUser = new User({
    email,
    username,
    password: hashedPassword,
    role,
    outletId: role === 'kasir' ? outletId : undefined,  // Only assign outletId for kasir
  });

  // Save the user to the database
  await newUser.save();

  logSuccess(`User registered: ${username}`);
  return {
    id: newUser._id,
    email: newUser.email,
    username: newUser.username,
    role: newUser.role
  };
};

// Login user (Owner, Kasir, or Customer)
const loginUser = async (email, password) => {
  const hashedPassword = generateMD5Hash(password);

  // Check if user exists with given email and password
  const user = await User.findOne({ email, password: hashedPassword });
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  logSuccess(`User logged in: ${user.username}`);
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role
  };
};

module.exports = {
  registerUser,
  loginUser
};
