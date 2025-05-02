const express = require("express");
const router = express.Router();

// Import controllers
const {
  registerController,
  loginController
} = require('../../controller/auth/auth_controller');

// Route untuk registrasi pengguna (Kasir atau Customer)
router.post('/register', registerController);

// Route untuk login pengguna (Owner, Kasir, atau Customer)
router.post('/login', loginController);

module.exports = router;
