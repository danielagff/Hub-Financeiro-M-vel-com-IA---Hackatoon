import { Pool, PoolClient } from 'pg';

let pool: Pool;

// Função para aguardar um tempo
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function connectPostgreSQL(): Promise<void> {
  const maxRetries = 10;
  const retryDelay = 2000; // 2 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      pool = new Pool({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'hackatoon_fmu',
      });

      // Testa a conexão
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      console.log('✅ PostgreSQL conectado com sucesso');
      return;
    } catch (error: any) {
      if (attempt < maxRetries) {
        console.log(`⏳ Tentativa ${attempt}/${maxRetries} - PostgreSQL ainda não está pronto, aguardando...`);
        await sleep(retryDelay);
      } else {
        console.error('❌ Erro ao conectar PostgreSQL após múltiplas tentativas:', error);
        throw error;
      }
    }
  }
}

export function getPostgreSQLPool(): Pool {
  if (!pool) {
    throw new Error('PostgreSQL pool não foi inicializado');
  }
  return pool;
}

export async function disconnectPostgreSQL(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ PostgreSQL desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar PostgreSQL:', error);
    throw error;
  }
}

