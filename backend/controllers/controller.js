const User = require("../models/User");
const Profile = require("../models/Profile");

/**
 * These two handlers exist mainly as a WORKED EXAMPLE of requireAuth /
 * requireRole (see ../middleware/auth.js and ../routes/routes.js). This file
 * was an empty placeholder before — swap these out for your real controllers
 * as each screen's backend gets built, following the same
 * model → controller → route pattern authController.js already uses.
 */

/**
 * GET /api/profile/me
 * Any logged-in user. Returns their own account + profile.
 *
 * 🔌 NOTE: this is NOT yet the shape frontend/src/services/postdateApi.js ->
 * getProfile() expects (see MOCK_PROFILE there) — map the fields in that
 * function once this replaces the mock, rather than reshaping this response
 * to match the frontend's guess.
 */
async function getMe(req, res) {
  const user = await User.findById(req.user.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });

  const profile = await Profile.findOne({ userId: user._id });
  res.json({ user, profile });
}

/**
 * GET /api/admin/ping
 * Admins and moderators only — confirms requireRole is wired correctly.
 * Not a real dashboard endpoint; replace with the real
 * GET /api/admin/:section from postdateApi.js when that gets built.
 */
async function getAdminPing(req, res) {
  res.json({ ok: true, role: req.user.role });
}

module.exports = { getMe, getAdminPing };
