const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * requireAuth
 * Verifies the Bearer token from the Authorization header and attaches
 * { userId, role } to req.user for downstream handlers.
 *
 * Deliberately re-reads the user from the DB on every request rather than
 * trusting the role baked into the token — a 7-day-old token shouldn't still
 * carry admin rights if that account got demoted (or deactivated) yesterday.
 *
 * Usage:
 *   router.get("/profile/me", requireAuth, asyncHandler(getMe));
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId).select("_id role isActive");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Authentication required" });
    }

    req.user = { userId: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    // Covers expired tokens, bad signatures, malformed tokens, etc. — all
    // read the same to the client on purpose.
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

/**
 * requireRole("admin", "moderator")
 * Use AFTER requireAuth on the same route. 403s if the current user's role
 * isn't one of the ones listed.
 *
 * Usage:
 *   router.get("/admin/ping", requireAuth, requireRole("admin", "moderator"), handler);
 */
function requireRole(...allowedRoles) {
  return function checkRole(req, res, next) {
    if (!req.user) {
      // Only happens if requireRole is used without requireAuth first —
      // fail closed rather than silently letting everyone through.
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You don't have permission to do that" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
