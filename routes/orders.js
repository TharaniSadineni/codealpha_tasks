const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// Helper to generate custom order number
const generateOrderNumber = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${randomNum}`;
};

// Helper for estimated delivery date string
const getEstimatedDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

// @route   POST /api/orders
// @desc    Create new order with payment selection & sandbox verification
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, paymentDetails, totalAmount } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.customerName || !shippingAddress.address) {
      return res.status(400).json({ success: false, message: 'Incomplete shipping address' });
    }

    const validMethods = ['Credit / Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery'];
    const chosenMethod = validMethods.includes(paymentMethod) ? paymentMethod : 'Cash on Delivery';

    // Sandbox payment verification mock
    let payDetails = {
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: chosenMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
      cardLast4: paymentDetails?.cardLast4 || '',
      upiId: paymentDetails?.upiId || '',
      bankName: paymentDetails?.bankName || ''
    };

    const orderNumber = generateOrderNumber();
    const estDate = getEstimatedDeliveryDate();

    const order = new Order({
      orderNumber,
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: chosenMethod,
      paymentDetails: payDetails,
      totalAmount,
      status: 'Confirmed',
      estimatedDeliveryDate: estDate
    });

    const createdOrder = await order.save();

    // Decrement product stock
    for (const item of orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: createdOrder
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user's orders
// @access  Private
router.get('/my-orders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details by Order ID or Order Number
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    let order = await Order.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { orderNumber: req.params.id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user owns order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
router.get('/', protect, admin, async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin)
// @access  Private (Admin)
router.put('/:id/status', protect, admin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
