const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const apiRoutes = require("./routes/routes.js");
const { generalLimiter } = require("./middleware/rateLimiter.js");
const { notFound, errorHandler } = require("./middleware/errorHandler.js");

dotenv.config();
connectDB();

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

// 🔒 General rate-limit ceiling for everything under /api. Auth routes
// (signup/login/verify) additionally get a much tighter limit applied
// inside authRoutes.js — both middlewares run, whichever trips first wins.
app.use("/api", generalLimiter);

// signup, log-in, email verification — see controllers/authController.js
app.use("/api", authRoutes);

// everything else — see controllers/controller.js + routes/routes.js
app.use("/api", apiRoutes);

// Unknown route -> 404 (must be registered after every real route)
app.use(notFound);

// Central error handler — always last. Never leaks stack traces to the
// client; logs the real error server-side and sends a generic message out.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
