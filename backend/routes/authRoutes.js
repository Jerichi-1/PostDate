const express = require("express");
const {
  register,
  login,
  sendVerificationCode,
  verifyCode,
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const { asyncHandler } = require("../middleware/errorHandler");
const { upload, MAX_FILES } = require("../middleware/upload");

const router = express.Router();

// Mounted at /api in server.js, so these become:
//   POST /api/signup
//   POST /api/auth/login
//   POST /api/verify/send
//   POST /api/verify/confirm
//
// authLimiter (see ../middleware/rateLimiter.js) applies a tighter limit to
// all four — these are the routes most worth brute-forcing.
//
// upload.array on /signup lets the sign-up photo step ride along with the
// rest of the form as multipart/form-data. It's a no-op for a plain JSON
// request (multer only engages for multipart content types), so this
// doesn't change anything for a signup sent without photos.
router.post("/signup", authLimiter, upload.array("photos", MAX_FILES), asyncHandler(register));
router.post("/auth/login", authLimiter, asyncHandler(login));
router.post("/verify/send", authLimiter, asyncHandler(sendVerificationCode));
router.post("/verify/confirm", authLimiter, asyncHandler(verifyCode));

module.exports = router;
