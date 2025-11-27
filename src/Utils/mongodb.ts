import mongoose from 'mongoose';

// Função para aguardar um tempo
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function connectMongoDB(): Promise<void> {
  const maxRetries = 10;
  const retryDelay = 2000; // 2 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackatoon_fmu';
      
      await mongoose.connect(mongoUri);
      
      console.log('✅ MongoDB conectado com sucesso');
      return;
    } catch (error: any) {
      if (attempt < maxRetries) {
        console.log(`⏳ Tentativa ${attempt}/${maxRetries} - MongoDB ainda não está pronto, aguardando...`);
        await sleep(retryDelay);
      } else {
        console.error('❌ Erro ao conectar MongoDB após múltiplas tentativas:', error);
        throw error;
      }
    }
  }
}

export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar MongoDB:', error);
    throw error;
  }
}

