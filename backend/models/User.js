const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // User's email address
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Store the HASHED password here, never the plain-text password
    passwordHash: {
      type: String,
      required: true
    },

    // User's actual name
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    middleName: {
      type: String,
      trim: true,
      maxlength: 50
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    // Controls permissions
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user"
    },

    // Whether the account has completed verification
    isVerified: {
      type: Boolean,
      default: false
    },

    // Allows you to disable an account without deleting it.
    // Staff suspend a member by setting this to false (see
    // controllers/adminController.js) — log-in and requireAuth both refuse
    // inactive accounts, so a suspension takes effect on the very next request.
    isActive: {
      type: Boolean,
      default: true
    },

    // 🆕 Last time this account made an authenticated request. Written at most
    // once a minute by requireAuth (middleware/auth.js). Drives the dashboard's
    // "Active" counter.
    lastActiveAt: {
      type: Date,
      default: null
    },

    // 🆕 Suspension bookkeeping. Cleared again on reinstatement.
    suspendedAt: {
      type: Date,
      default: null
    },

    suspensionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    // Automatically creates createdAt and updatedAt
    timestamps: true
  }
);

// 🆕 Admin dashboard: newest members first, and "who's active right now"
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, lastActiveAt: -1 });

// Export the User model
module.exports = mongoose.model("User", userSchema);
