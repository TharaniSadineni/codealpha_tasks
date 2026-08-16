const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Helper function to return user payload
const formatUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  avatar: user.avatar || '',
  wishlist: user.wishlist || [],
  addresses: user.addresses || [],
  savedCards: user.savedCards || [],
  notificationPrefs: user.notificationPrefs || { emailPromos: true, orderUpdates: true, smsAlerts: false }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'user',
      addresses: [],
      savedCards: []
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: formatUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('wishlist');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: formatUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json({
    success: true,
    user: formatUserPayload(user)
  });
});

// @route   PUT /api/auth/profile
// @desc    Update profile details
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, notificationPrefs } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (notificationPrefs) user.notificationPrefs = { ...user.notificationPrefs, ...notificationPrefs };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: formatUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using account email address
 * @access  Public (College Demonstration Flow)
 * @note    FOR DEMONSTRATION PURPOSES ONLY. In a commercial production deployment,
 *          this endpoint must be guarded with email OTP or OAuth token verification.
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successfully!',
      token,
      user: formatUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/wishlist/toggle
// @desc    Add or remove product from wishlist
// @access  Private
router.post('/wishlist/toggle', protect, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(productId);
    let isWishlisted = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      isWishlisted = false;
    } else {
      user.wishlist.push(productId);
      isWishlisted = true;
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      success: true,
      message: isWishlisted ? 'Added to Wishlist' : 'Removed from Wishlist',
      isWishlisted,
      wishlist: updatedUser.wishlist
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({
      success: true,
      count: user.wishlist ? user.wishlist.length : 0,
      wishlist: user.wishlist || []
    });
  } catch (error) {
    next(error);
  }
});

// Address CRUD Routes
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const newAddress = req.body;

    if (newAddress.isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => addr.isDefault = false);
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

router.put('/addresses/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);

    if (!addr) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    Object.assign(addr, req.body);
    if (req.body.isDefault) {
      user.addresses.forEach(a => {
        if (a._id.toString() !== req.params.id) a.isDefault = false;
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/addresses/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull({ _id: req.params.id });
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

router.put('/addresses/:id/default', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.forEach(a => {
      a.isDefault = (a._id.toString() === req.params.id);
    });

    await user.save();

    res.json({
      success: true,
      message: 'Default address updated',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

// Saved Payment Methods Routes
router.post('/payment-methods', protect, async (req, res, next) => {
  try {
    const { cardHolder, cardNumber, expMonth, expYear } = req.body;
    if (!cardHolder || !cardNumber || !expMonth || !expYear) {
      return res.status(400).json({ success: false, message: 'Invalid card details' });
    }

    const cleanCard = cardNumber.replace(/\s+/g, '');
    const last4 = cleanCard.slice(-4) || '4242';
    const brand = cleanCard.startsWith('4') ? 'Visa' : cleanCard.startsWith('5') ? 'Mastercard' : cleanCard.startsWith('6') ? 'RuPay' : 'Card';

    const user = await User.findById(req.user._id);
    user.savedCards.push({
      brand,
      last4,
      expMonth,
      expYear,
      cardHolder,
      token: `tok_sandbox_${Date.now()}_${Math.random().toString(36).substring(7)}`
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Payment method saved securely',
      savedCards: user.savedCards
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/payment-methods/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedCards.pull({ _id: req.params.id });
    await user.save();

    res.json({
      success: true,
      message: 'Payment method removed',
      savedCards: user.savedCards
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
