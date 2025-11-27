import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB } from './Utils/mongodb';
import { connectPostgreSQL } from './Utils/postgresql';
import { initDatabase } from './Utils/initDatabase';
import { pingRouter } from './Controller/pingController';
import { userRouter } from './Controller/userController';
import { authRouter } from './Controller/authController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/ping', pingRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);

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



