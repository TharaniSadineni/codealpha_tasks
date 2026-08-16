const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/posts
// @desc    Get all posts for feed
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name username profilePic')
      .sort({ createdAt: -1 });

    // Attach comments count to each post
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ post: post._id });
        const postObj = post.toObject();
        postObj.commentsCount = commentsCount;
        return postObj;
      })
    );

    res.json(postsWithDetails);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts feed' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name username profilePic')
      .sort({ createdAt: -1 });

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ post: post._id });
        const postObj = post.toObject();
        postObj.commentsCount = commentsCount;
        return postObj;
      })
    );

    res.json(postsWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name username profilePic bio');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const commentsCount = await Comment.countDocuments({ post: post._id });
    const postObj = post.toObject();
    postObj.commentsCount = commentsCount;

    res.json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post details' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { caption, presetImage } = req.body;

    if (!caption) {
      return res.status(400).json({ message: 'Caption is required' });
    }

    let imagePath = presetImage || '/images/posts/post1.png';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create({
      author: req.user._id,
      caption,
      image: imagePath,
      likes: []
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'name username profilePic');
    const postObj = populatedPost.toObject();
    postObj.commentsCount = 0;

    res.status(201).json(postObj);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Edit own post (caption/image)
// @access  Private
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { caption, presetImage } = req.body;
    if (caption) post.caption = caption;

    if (req.file) {
      post.image = `/uploads/${req.file.filename}`;
    } else if (presetImage) {
      post.image = presetImage;
    }

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate('author', 'name username profilePic');
    const commentsCount = await Comment.countDocuments({ post: post._id });
    
    const postObj = populatedPost.toObject();
    postObj.commentsCount = commentsCount;

    res.json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete own post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Remove post comments as well
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    res.json({ message: 'Post deleted successfully', postId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like / Unlike a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      isLiked: !isLiked,
      likes: post.likes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating post like' });
  }
});

module.exports = router;
