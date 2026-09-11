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

    // Allows you to disable an account without deleting it
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    // Automatically creates createdAt and updatedAt
    timestamps: true
  }
);

// Export the User model
module.exports = mongoose.model("User", userSchema);