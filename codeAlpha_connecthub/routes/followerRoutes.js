const express = require('express');
const router = express.Router();
const Follower = require('../models/Follower');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/followers/follow/:targetUserId
// @desc    Follow a user
// @access  Private
router.post('/follow/:targetUserId', protect, async (req, res) => {
  try {
    const followerId = req.user._id;
    const targetUserId = req.params.targetUserId;

    if (followerId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    const existingFollow = await Follower.findOne({
      follower: followerId,
      following: targetUserId
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    await Follower.create({
      follower: followerId,
      following: targetUserId
    });

    const followersCount = await Follower.countDocuments({ following: targetUserId });
    const followingCount = await Follower.countDocuments({ follower: targetUserId });

    res.json({
      message: `Successfully followed ${targetUser.username}`,
      isFollowing: true,
      followersCount,
      followingCount
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Error following user' });
  }
});

// @route   POST /api/followers/unfollow/:targetUserId
// @desc    Unfollow a user
// @access  Private
router.post('/unfollow/:targetUserId', protect, async (req, res) => {
  try {
    const followerId = req.user._id;
    const targetUserId = req.params.targetUserId;

    const followDoc = await Follower.findOneAndDelete({
      follower: followerId,
      following: targetUserId
    });

    if (!followDoc) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    const targetUser = await User.findById(targetUserId);
    const followersCount = await Follower.countDocuments({ following: targetUserId });
    const followingCount = await Follower.countDocuments({ follower: targetUserId });

    res.json({
      message: `Successfully unfollowed ${targetUser ? targetUser.username : 'user'}`,
      isFollowing: false,
      followersCount,
      followingCount
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});

// @route   GET /api/followers/status/:targetUserId
// @desc    Check follow status for logged-in user
// @access  Private
router.get('/status/:targetUserId', protect, async (req, res) => {
  try {
    const followerId = req.user._id;
    const targetUserId = req.params.targetUserId;

    const followDoc = await Follower.findOne({
      follower: followerId,
      following: targetUserId
    });

    res.json({ isFollowing: !!followDoc });
  } catch (error) {
    res.status(500).json({ message: 'Error checking follow status' });
  }
});

// @route   GET /api/followers/user/:userId/followers
// @desc    Get followers list for a user
// @access  Public
router.get('/user/:userId/followers', async (req, res) => {
  try {
    const list = await Follower.find({ following: req.params.userId })
      .populate('follower', 'name username profilePic bio')
      .sort({ createdAt: -1 });

    const followers = list.map(item => item.follower);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching followers list' });
  }
});

// @route   GET /api/followers/user/:userId/following
// @desc    Get following list for a user
// @access  Public
router.get('/user/:userId/following', async (req, res) => {
  try {
    const list = await Follower.find({ follower: req.params.userId })
      .populate('following', 'name username profilePic bio')
      .sort({ createdAt: -1 });

    const following = list.map(item => item.following);
    res.json(following);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching following list' });
  }
});

module.exports = router;
