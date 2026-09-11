const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    // Person reporting something
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // What was reported
    targetType: {
      type: String,
      enum: ["user", "post", "comment", "message"],
      required: true
    },

    // ID of whatever was reported
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    reason: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending"
    },

    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Find pending moderation reports
reportSchema.index({ status: 1, createdAt: -1 });

// Find reports made by a user
reportSchema.index({ reporterId: 1 });

module.exports = mongoose.model("Report", reportSchema);