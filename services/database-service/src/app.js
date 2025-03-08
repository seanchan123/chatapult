// src/app.js
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Use morgan to log requests
app.use(morgan('combined'));

// Middleware to parse JSON
app.use(express.json());

// Allow requests from frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Database Service running on port ${PORT}`));
