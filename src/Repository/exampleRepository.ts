import { IExampleRepository } from './InterfacesRepository/exampleRepository';
import { getPostgreSQLPool } from '../Utils/postgresql';
import mongoose from 'mongoose';

// Exemplo de repositório que pode usar MongoDB ou PostgreSQL
export class ExampleRepository implements IExampleRepository {
  // Exemplo usando PostgreSQL
  async findAll(): Promise<any[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM examples');
    return result.rows;
  }

  async findById(id: string): Promise<any | null> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM examples WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(data: any): Promise<any> {
    const pool = getPostgreSQLPool();
    const result = await pool.query(
      'INSERT INTO examples (name, description) VALUES ($1, $2) RETURNING *',
      [data.name, data.description]
    );
    return result.rows[0];
  }

  async update(id: string, data: any): Promise<any> {
    const pool = getPostgreSQLPool();
    const result = await pool.query(
      'UPDATE examples SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [data.name, data.description, id]
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    const pool = getPostgreSQLPool();
    await pool.query('DELETE FROM examples WHERE id = $1', [id]);
  }
}

