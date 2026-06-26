import express from 'express';
import dotenv from 'dotenv';
import prisma from './config/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint Health Check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'success',
      message: 'EventHub API is running perfectly',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed!',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});