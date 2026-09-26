const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const profileRoutes = require("./routes/profileRoutes.js");
const apiRoutes = require("./routes/routes.js");
const { generalLimiter } = require("./middleware/rateLimiter.js");
const { notFound, errorHandler } = require("./middleware/errorHandler.js");
const { UPLOAD_DIR, ensureUploadDir } = require("./utils/photoStorage.js");

dotenv.config();
connectDB();
ensureUploadDir().catch((err) => console.error("Could not create uploads/ directory:", err));

if (!process.env.JWT_SECRET) {
  // Not fatal — the server still starts — but every login will 500 until
  // this is set. See .env.example.
  console.warn("⚠️  JWT_SECRET is not set in .env — logging in will fail until it is.");
}

const app = express();

// 🔒 Security headers — safer defaults (no-sniff, frameguard, hides
// X-Powered-By, etc). See backend/SECURITY.md for the full rundown.
app.use(helmet());

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MERN API is running...");
});

app.get("/api", (req, res) => {
  res.send("MERN API is running...");
});

// 🔌 UPLOADED PHOTOS: served straight off disk from backend/uploads/ — see
// utils/photoStorage.js for how files land there and the note on why this
// is local-only storage. Helmet's default Cross-Origin-Resource-Policy is
// "same-origin", which would silently block the frontend (a different
// origin in dev, :5173 vs :5000) from rendering these as <img> src. That
// header is loosened ONLY for this one path, not the whole app, since JSON
// API responses don't need it relaxed.
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(UPLOAD_DIR)
);

// 🔒 General rate-limit ceiling for everything under /api. Auth routes
// (signup/login/verify) additionally get a much tighter limit applied
// inside authRoutes.js — both middlewares run, whichever trips first wins.
app.use("/api", generalLimiter);

// signup, log-in, email verification — see controllers/authController.js
app.use("/api", authRoutes);

// taste tags, looking-for, photo upload/delete, avatar — see
// controllers/profileController.js
app.use("/api", profileRoutes);

// everything else — see controllers/controller.js + routes/routes.js
app.use("/api", apiRoutes);

// Unknown route -> 404 (must be registered after every real route)
app.use(notFound);

// Central error handler — always last. Never leaks stack traces to the
// client; logs the real error server-side and sends a generic message out.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
