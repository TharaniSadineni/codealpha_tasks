const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'Followers'
  }
);

// Ensure unique follower-following pair
followerSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follower', followerSchema);
