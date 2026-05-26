const mongoose = require('mongoose');

const connectDB = async () => {
  let mongoURI = process.env.MONGO_URI;

  // Gracefully fallback to local MongoDB if Atlas connection string contains the password placeholder
  if (mongoURI.includes('<db_password>')) {
    console.warn('⚠️ Warning: MONGO_URI contains "<db_password>" placeholder. Falling back to local MongoDB.');
    mongoURI = 'mongodb://localhost:27017/college_allotment';
  }

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`🚀 MongoDB Connected Successfully to: ${mongoURI.split('@')[1] || mongoURI}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // If it was Atlas and failed, try local fallback as last resort
    if (mongoURI !== 'mongodb://localhost:27017/college_allotment') {
      console.log('🔄 Attempting connection to local MongoDB fallback...');
      try {
        await mongoose.connect('mongodb://localhost:27017/college_allotment', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('🚀 Connected to Local MongoDB Fallback successfully!');
      } catch (localError) {
        console.error('❌ Failed to connect to local MongoDB fallback as well:', localError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
