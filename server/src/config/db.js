

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() returns a Promise
    // We use async/await to wait for the connection
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    // If we reach this line, connection was successful
    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    console.log(`📦 Database: ${connection.connection.name}`);

  } catch (error) {
    // If connection fails, log the error clearly
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);

    // Exit the process with failure code (1)
    // We don't want the server running without a database
    process.exit(1);
  }
};

module.exports = connectDB;
