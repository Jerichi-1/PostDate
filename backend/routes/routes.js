const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { getMe, getAdminPing } = require("../controllers/controller");

const router = express.Router();

// Mounted at /api in server.js. This file was an empty placeholder before —
// these two routes are worked examples of requireAuth / requireRole (see
// the note at the top of controllers/controller.js). Add real routes here
// the same way:
//
//   router.METHOD(path, requireAuth, [requireRole(...role),] asyncHandler(fn))

// Any logged-in user
router.get("/profile/me", requireAuth, asyncHandler(getMe));

// Admins and moderators only
router.get(
  "/admin/ping",
  requireAuth,
  requireRole("admin", "moderator"),
  asyncHandler(getAdminPing)
);

module.exports = router;
