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

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message || "Invalid request" : "Something went wrong";
  res.status(status).json({ message });
}

module.exports = { asyncHandler, notFound, errorHandler };
