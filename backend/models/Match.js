const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    // First person in the match
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Second person in the match
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["active", "unmatched", "blocked"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

// Find matches for either user
matchSchema.index({ user1: 1, status: 1 });
matchSchema.index({ user2: 1, status: 1 });

module.exports = mongoose.model("Match", matchSchema);