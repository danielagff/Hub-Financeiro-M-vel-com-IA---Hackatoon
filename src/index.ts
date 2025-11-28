import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB } from './Utils/mongodb';
import { connectPostgreSQL } from './Utils/postgresql';
import { initDatabase } from './Utils/initDatabase';
import { setupSwagger } from './Utils/swagger';
import { pingRouter } from './Controller/pingController';
import { userRouter } from './Controller/userController';
import { authRouter } from './Controller/authController';
import { transactionRouter } from './Controller/transactionController';
import { expenseRouter } from './Controller/expenseController';
import { transferRouter } from './Controller/transferController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP para Swagger UI
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
setupSwagger(app);

// Routes
app.use('/ping', pingRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/transactions', transactionRouter);
app.use('/expenses', expenseRouter);
app.use('/transfers', transferRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: 'connected',
    postgresql: 'connected'
  });
});

async function startServer() {
  try {
    await connectMongoDB();
    await connectPostgreSQL();
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();



