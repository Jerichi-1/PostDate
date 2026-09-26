const multer = require("multer");

/**
 * asyncHandler
 * Wraps an async route handler so a rejected promise is forwarded to
 * Express's error-handling middleware instead of crashing the process or
 * hanging the request forever.
 *
 *   router.get("/x", asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 for any route that didn't match anything above it. Must be registered
 * AFTER every real route (see server.js) — otherwise nothing ever reaches
 * it. Keeps unknown routes from falling through to the generic 500 handler
 * with a misleading status code.
 */
function notFound(req, res, next) {
  res.status(404).json({ message: "Not found" });
}

// Multer's own error codes -> a message safe to show the person who hit it.
// See middleware/upload.js for the limits these refer to.
const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: "Each photo must be under 5MB",
  LIMIT_FILE_COUNT: "Too many photos in one upload",
  LIMIT_UNEXPECTED_FILE: "Too many photos in one upload",
};

/**
 * Central error handler. Must be the LAST app.use() in server.js.
 *
 * Always logs the real error server-side, but only ever sends a generic
 * message to the client for anything that isn't a known, safe-to-describe
 * error shape — never a stack trace, a file path, or a raw driver message.
 */
function errorHandler(err, req, res, next) {
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err);

  if (res.headersSent) return next(err);

  // Mongoose validation errors -> 400. Field names are safe to return;
  // Mongoose's own message text sometimes isn't, so we don't forward it.
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Invalid input",
      fields: Object.keys(err.errors || {}),
    });
  }

  // Duplicate key (unique index) -> 409
  if (err.code === 11000) {
    return res.status(409).json({ message: "That value is already in use" });
  }

  // Malformed ObjectId, etc.
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid request" });
  }

  // A photo upload broke a limit from middleware/upload.js (file too big,
  // too many files) — 400, not the generic 500.
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: MULTER_MESSAGES[err.code] || "Could not upload that file" });
  }

  // Thrown by upload.js's fileFilter for a disallowed mimetype.
  if (err.message === "UNSUPPORTED_FILE_TYPE") {
    return res.status(400).json({ message: "Only JPG, PNG, WEBP or GIF images are allowed" });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message || "Invalid request" : "Something went wrong";
  res.status(status).json({ message });
}

module.exports = { asyncHandler, notFound, errorHandler };
