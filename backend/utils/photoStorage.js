const fs = require("fs/promises");
const path = require("path");
const { randomFilename } = require("../middleware/upload");

// backend/uploads — served statically at /uploads (see server.js). Kept out
// of git (see .gitignore) since this is local disk storage, not a real file
// service: it will NOT survive a redeploy on hosts with an ephemeral
// filesystem (Render, Heroku, ...). Fine for coursework; swap for S3/
// Cloudinary/etc. later by changing only this file and server.js's static
// mount — nothing else references the disk path directly.
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Writes multer's in-memory file buffers to disk and returns their public
 * paths (what gets stored on Profile.photos / Profile.avatar), e.g.
 * ["/uploads/3f9a...c2.jpg"]. Only call this once a request is otherwise
 * fully valid — a half-written signup shouldn't leave files behind.
 */
async function savePhotosToDisk(files = []) {
  await ensureUploadDir();
  const saved = [];
  for (const file of files) {
    const filename = randomFilename(file.mimetype);
    await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
    saved.push(`/uploads/${filename}`);
  }
  return saved;
}

/**
 * Deletes one photo's file from disk, given its public path. path.basename
 * strips any directory component, so this can never be tricked into
 * deleting something outside UPLOAD_DIR even if a caller forgot to validate
 * the path first (callers should still only ever pass a path already
 * confirmed to belong to the user — see profileController.deletePhoto).
 * A file that's already gone is not an error.
 */
async function deletePhotoFile(publicPath) {
  const filename = path.basename(publicPath);
  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

module.exports = { UPLOAD_DIR, ensureUploadDir, savePhotosToDisk, deletePhotoFile };
