const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    // Links this profile to the User account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // Name displayed on the dating profile
    profileName: {
      type: String,
      trim: true,
      maxlength: 50
    },

    // Used to calculate the user's current age
    dateOfBirth: {
      type: Date,
      required: true
    },

    gender: {
      type: String,
      required: true,
      trim: true
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    location: {
      city: {
        type: String,
        trim: true
      },

      country: {
        type: String,
        trim: true
      }
    },

    interests: {
      type: [String],
      default: []
    },

    lookingFor: {
      genders: {
        type: [String],
        default: []
      },

      minAge: {
        type: Number,
        min: 18
      },

      maxAge: {
        type: Number,
        min: 18
      }
    },

    photos: {
      type: [String],
      default: []
    },

    followersCount: {
      type: Number,
      default: 0
    },

    followingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Profile", profileSchema);