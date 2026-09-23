const express = require("express");
const {
  register,
  login,
  sendVerificationCode,
  verifyCode,
} = require("../controllers/authController");

const router = express.Router();

// Mounted at /api in server.js, so these become:
//   POST /api/signup
//   POST /api/auth/login
//   POST /api/verify/send
//   POST /api/verify/confirm
router.post("/signup", register);
router.post("/auth/login", login);
router.post("/verify/send", sendVerificationCode);
router.post("/verify/confirm", verifyCode);

module.exports = router;
