const rateLimit = require("express-rate-limit");
const MongoRateStore = require("../utils/mongoRateStore");
const sharedStore = (namespace) => process.env.NODE_ENV === "production" ? new MongoRateStore(namespace) : undefined;

// Jest sets NODE_ENV=test automatically, so this relaxation needs no extra
// setup. Without it, auth.test.js alone (20+ signup/login/verify calls in
// one run) would trip the real 20-per-15-min limit partway through and
// start failing tests for the wrong reason. tests/rateLimiter.test.js
// builds its own strict limiter directly, so the mechanism itself still
// gets exercised even with this relaxed in test mode.
const isTestEnv = process.env.NODE_ENV === "test";

// 🎛️ Tighter limiter for auth endpoints — these are the ones worth brute-forcing.
const authLimiter = rateLimit({
  store: sharedStore("auth"),
  passOnStoreError: false,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnv ? 1000 : 20, // 20 requests per IP per window in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

// Looser general limiter for everything else under /api.
const generalLimiter = rateLimit({
  store: sharedStore("general"),
  passOnStoreError: false,
  windowMs: 15 * 60 * 1000, 
  max: isTestEnv ? 1000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

module.exports = { authLimiter, generalLimiter };
