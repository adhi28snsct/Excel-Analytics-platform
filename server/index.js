import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
app.use('/api', historyRoutes);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());

// Root route for sanity check
app.get('/', (req, res) => {
  res.send('API is working!');
});

// Mount only once per route group!
app.use('/api/auth', authRoutes);       // login/register will be under /api/auth
app.use('/api/upload', uploadRoutes);   // file upload APIs (if needed)

// MongoDB connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});