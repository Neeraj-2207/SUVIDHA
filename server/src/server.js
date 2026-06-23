// server.js - Updated to connect to MongoDB before starting

const app = require('./app');
const connectDB = require('./config/db');  // Import our DB connection function

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────
// IMPORTANT: Connect to DB first, THEN start server
// We don't want to accept requests if there's no database
// ─────────────────────────────────────────

const startServer = async () => {
  // Step 1: Connect to MongoDB
  await connectDB();

  // Step 2: Only after DB is connected, start the HTTP server
  app.listen(PORT, () => {
    console.log(`✅ SUVIDHA Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
};

// Run the startup function
startServer();