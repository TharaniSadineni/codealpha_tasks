const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      default: 'Hello! I am using ConnectHub.',
      trim: true
    },
    profilePic: {
      type: String,
      default: '/images/avatars/avatar1.png'
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'Users'
  }
);

module.exports = mongoose.model('User', userSchema);
