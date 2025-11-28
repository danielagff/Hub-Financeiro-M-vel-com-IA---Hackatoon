import { getPostgreSQLPool } from './postgresql';

export async function initDatabase(): Promise<void> {
  try {
    const pool = getPostgreSQLPool();
    
    // Migração: Remover coluna chave_pix se existir (estrutura antiga)
    try {
      await pool.query(`
        ALTER TABLE users DROP COLUMN IF EXISTS chave_pix
      `);
      console.log('Migração: Coluna chave_pix removida (se existia)');
    } catch (error: any) {
      // Ignora erro se a coluna não existir
      if (!error.message.includes('does not exist')) {
        console.warn('Aviso ao tentar remover coluna chave_pix:', error.message);
      }
    }
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        type VARCHAR(10) NOT NULL DEFAULT 'NORMAL' CHECK (type IN ('ADMIN', 'NORMAL')),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
        credit_score INTEGER NOT NULL DEFAULT 0 CHECK (credit_score >= 0 AND credit_score <= 1000),
        configuration JSONB DEFAULT '{}',
        ia_agent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela users criada');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_id ON users(id)
    `);
    console.log('Índices da tabela users criados');

    // Criar função para atualizar updated_at se não existir
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    console.log('Função update_updated_at_column criada/atualizada');

    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users
    `);
    await pool.query(`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('Trigger update_users_updated_at criado');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_pix_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        key VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela user_pix_keys criada');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_pix_keys_user_id ON user_pix_keys(user_id)
    `);
    console.log('Índices da tabela user_pix_keys criados');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(10) NOT NULL CHECK (type IN ('DEBIT', 'CREDIT')),
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
        details TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(20) NOT NULL DEFAULT 'OTHER' CHECK (category IN ('FOOD','TRANSPORT','ENTERTAINMENT','EXPENSES','OTHER')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela transactions criada');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)
    `);
    console.log('Índices da tabela transactions criados');

    await pool.query(`
      DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions
    `);
    await pool.query(`
      CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('Trigger update_transactions_updated_at criado');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_recurring_payment BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
        description VARCHAR(255) NOT NULL,
        execution_date TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','FAILED','SUCCESS')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela user_expenses criada');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_expenses_user_id ON user_expenses(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_expenses_status ON user_expenses(status)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_expenses_execution_date ON user_expenses(execution_date)
    `);
    console.log('Índices da tabela user_expenses criados');

    await pool.query(`
      DROP TRIGGER IF EXISTS update_user_expenses_updated_at ON user_expenses
    `);
    await pool.query(`
      CREATE TRIGGER update_user_expenses_updated_at BEFORE UPDATE ON user_expenses
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('Trigger update_user_expenses_updated_at criado');
    
    console.log('Todas as tabelas do PostgreSQL criadas/verificadas com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}
