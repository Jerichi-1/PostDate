const express = require("express");
const {
  register,
  login,
  sendVerificationCode,
  verifyCode,
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// Mounted at /api in server.js, so these become:
//   POST /api/signup
//   POST /api/auth/login
//   POST /api/verify/send
//   POST /api/verify/confirm
//
// authLimiter (see ../middleware/rateLimiter.js) applies a tighter limit to
// all four — these are the routes most worth brute-forcing.
router.post("/signup", authLimiter, asyncHandler(register));
router.post("/auth/login", authLimiter, asyncHandler(login));
router.post("/verify/send", authLimiter, asyncHandler(sendVerificationCode));
router.post("/verify/confirm", authLimiter, asyncHandler(verifyCode));

module.exports = router;
