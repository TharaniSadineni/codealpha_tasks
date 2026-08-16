const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Follower = require('../models/Follower');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/users
// @desc    Get all users / suggested users
// @access  Public
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// @route   GET /api/users/by-username/:username
// @desc    Get user profile details with posts, followers, following count
// @access  Public (Optional auth for follow status)
router.get('/by-username/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postsCount = await Post.countDocuments({ author: user._id });
    const followersCount = await Follower.countDocuments({ following: user._id });
    const followingCount = await Follower.countDocuments({ follower: user._id });

    let isFollowing = false;
    let authUserId = req.query.authUserId;
    if (authUserId) {
      const followDoc = await Follower.findOne({ follower: authUserId, following: user._id });
      if (followDoc) isFollowing = true;
    }

    res.json({
      user,
      postsCount,
      followersCount,
      followingCount,
      isFollowing
    });
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update logged-in user profile (name, bio, profilePic)
// @access  Private
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, bio, presetAvatar } = req.body;
    if (name) user.name = name;
    if (bio) user.bio = bio;

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    } else if (presetAvatar) {
      user.profilePic = presetAvatar;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
