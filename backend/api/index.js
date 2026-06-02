// Vercel serverless function entry point
// Set VERCEL environment variable to indicate serverless environment
process.env.VERCEL = '1';

const connectDB = require('../db');
const app = require('../src/server');

// Export the Express app as a serverless function
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
