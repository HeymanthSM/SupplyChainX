import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import { errorHandler } from './middleware/error.middleware';
import prisma from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow all origins for dev/docker integration
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api', router);

// Error Handling Middleware
app.use(errorHandler);

// Start Server and verify DB connection
const startServer = async () => {
  try {
    // Attempt prisma connection
    await prisma.$connect();
    console.log('🔌 Connected to PostgreSQL Database via Prisma ORM.');
  } catch (error: any) {
    console.error('⚠️ Database connection failed. Running API server in Mock Mode:', error.message);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 SupplyChainX Backend API server running on port ${PORT}`);
  });
};

startServer();
