import express from 'express';
import dotenv from 'dotenv';
import prisma from './config/prisma.js';

import userRoutes from './routes/user.routes.js';
import eventRoutes from './routes/event.routes.js'; 
import transactionRoutes from './routes/transaction.routes.js';
import teamRoutes from './routes/team.routes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Endpoint Health Check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'success',
      message: 'EventHub API is running perfectly on ES Modules!',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed!',
      error: error.message
    });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/teams', teamRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});