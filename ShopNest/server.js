const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Production Security Check: Enforce JWT_SECRET requirement
if (isProduction && !process.env.JWT_SECRET) {
  console.error('❌ FATAL SECURITY ERROR: JWT_SECRET environment variable is required in production!');
  console.error('Please configure JWT_SECRET in your environment variables or .env file before starting.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Custom 404 API Route handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Fallback route to serve index or 404 for pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Database Connection Manager
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (isProduction) {
    if (!mongoURI) {
      console.error('❌ FATAL ERROR: MONGODB_URI environment variable is required in production mode!');
      process.exit(1);
    }
    try {
      await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ Production MongoDB Connected to: ${mongoose.connection.host}`);
    } catch (err) {
      console.error('❌ FATAL ERROR: Failed to connect to Production MongoDB:', err.message);
      console.error('Stopping server. In-memory database fallback is disabled in production mode.');
      process.exit(1);
    }
    return;
  }

  // Development mode: Attempt local MongoDB connection or fallback to MongoMemoryServer
  const devURI = mongoURI || 'mongodb://127.0.0.1:27017/shopnest';
  try {
    await mongoose.connect(devURI, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ Development MongoDB Connected to: ${mongoose.connection.host}`);
  } catch (err) {
    console.log('⚠️ Local MongoDB not detected. Initializing Memory Mongo Database Server for development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅ MongoMemoryServer Connected at: ${uri}`);
      
      // Auto-seed memory database if fresh
      const seedFunc = require('./seed');
      if (typeof seedFunc === 'function') {
        await seedFunc(false);
      }
    } catch (memErr) {
      console.error('❌ Failed to connect to memory database:', memErr.message);
    }
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 ShopNest Server is running at http://localhost:${PORT}`);
  });
});

module.exports = app;
