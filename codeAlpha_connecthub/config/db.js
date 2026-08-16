const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecthub';
  try {
    // Attempt connecting to local or configured MongoDB instance
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[Database] Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.log('[Database] Local MongoDB connection failed or not running. Starting Mongo Memory Server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[Database] Connected to MongoMemoryServer at ${mongoUri}`);
    } catch (fallbackErr) {
      console.error('[Database] Failed to start MongoDB connection:', fallbackErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
