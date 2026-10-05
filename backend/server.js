const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { startupStep } = require("./utils/startup");
const connectDB = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { validateEnvironment, securityMiddleware, validateRequest } = require("./middleware/security");
const { UPLOAD_DIR, ensureUploadDir } = require("./utils/photoStorage");
const { isCloudStorage, cloudConfig, cloudPhotoUrl, validFilename } = require("./utils/cloudPhotos");

mongoose.set("debug", false);

function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("query parser", "simple");
  // Keep trust proxy disabled unless exact proxy addresses are configured.
  if (process.env.TRUST_PROXY) app.set("trust proxy", process.env.TRUST_PROXY.split(",").map((value) => value.trim()));
  app.use(helmet({ contentSecurityPolicy: { directives: {
    "script-src": ["'self'"], "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "https://fonts.gstatic.com"], "img-src": ["'self'", "blob:", "data:", ...(isCloudStorage() ? [`https://res.cloudinary.com/${cloudConfig().cloud}/`] : [])],
    "connect-src": ["'self'"], "object-src": ["'none'"], "frame-ancestors": ["'none'"],
  } } }));
  app.get("/healthz", (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.set("Cache-Control", "no-store").status(ready ? 200 : 503).json({ status: ready ? "ready" : "unavailable" });
  });
  app.use("/api", generalLimiter, ...securityMiddleware());
  app.use("/api", (req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  app.use(express.json({ limit: "64kb", strict: true }));
  app.use("/api", validateRequest);
  app.use("/api", require("./routes/authRoutes"));
  app.use("/api", require("./routes/profileRoutes"));
  app.use("/api", require("./routes/adminRoutes"));
  app.use("/api", require("./routes/safetyRoutes"));
  app.use("/api", require("./routes/routes"));
  app.use("/api", require("./routes/memberRoutes"));
  app.use("/api", notFound);
  if (isCloudStorage()) {
    app.get("/uploads/:filename", (req, res) => {
      if (!validFilename(req.params.filename)) return res.sendStatus(404);
      return res.redirect(302, cloudPhotoUrl(req.params.filename));
    });
  } else {
    app.use("/uploads", (req, res, next) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    }, express.static(UPLOAD_DIR, { dotfiles: "deny", index: false, fallthrough: false }));
  }
  if (process.env.NODE_ENV === "production") {
    const frontend = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontend, { dotfiles: "deny", index: false }));
    app.get(["/", "/login", "/signup", "/profile", "/discover", "/admin", "/moderator"], (req, res) => res.sendFile(path.join(frontend, "index.html")));
  } else {
    app.get("/", (req, res) => res.send("PostDate API is running"));
  }
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

async function start() {
  await startupStep("environment configuration", validateEnvironment);
  await startupStep("MongoDB connection", connectDB);
  await startupStep("photo storage", ensureUploadDir);
  await startupStep("rate counter indexes", () => require("./models/RateCounter").init());
  await startupStep("swipe indexes", () => require("./models/Swipe").init());
  await startupStep("match indexes", () => require("./models/Match").init());
  const app = await startupStep("HTTP configuration and client origin", createApp);
  const server = app.listen(process.env.PORT || 5000, () => console.log("Server started"));
  for (const signal of ["SIGTERM", "SIGINT"]) process.once(signal, () => {
    const timer = setTimeout(() => process.exit(1), 10000);
    timer.unref();
    server.close(async () => { await mongoose.disconnect(); clearTimeout(timer); });
  });
  return server;
}

if (require.main === module) start().catch(async (error) => {
  console.error(error.safeStartupMessage || "Startup failed: check server configuration");
  await mongoose.disconnect();
  process.exitCode = 1;
});
module.exports = { createApp, start };
