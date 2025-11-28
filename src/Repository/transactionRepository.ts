import { ITransactionRepository } from './InterfacesRepository/transactionRepository';
import { CreateTransactionDto, UpdateTransactionDto, TransactionResponseDto } from '../Models/dto/transactionDto';
import { getPostgreSQLPool } from '../Utils/postgresql';

export class TransactionRepository implements ITransactionRepository {
  private toResponseDto(row: any): TransactionResponseDto {
    return {
      id: row.id,
      type: row.type,
      date: row.date,
      amount: parseFloat(row.amount),
      details: row.details,
      userId: row.user_id,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(): Promise<TransactionResponseDto[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM transactions ORDER BY id');
    return result.rows.map((r: any) => this.toResponseDto(r));
  }

  async findById(id: number): Promise<TransactionResponseDto | null> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.toResponseDto(result.rows[0]);
  }

  async findByUserId(userId: number): Promise<TransactionResponseDto[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
    return result.rows.map((r: any) => this.toResponseDto(r));
  }

  async create(data: CreateTransactionDto): Promise<TransactionResponseDto> {
    const pool = getPostgreSQLPool();
    const result = await pool.query(
      `INSERT INTO transactions (type, date, amount, details, user_id, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.type,
        data.date ? new Date(data.date) : new Date(),
        data.amount,
        data.details || null,
        data.userId,
        data.category || 'OTHER',
      ]
    );

    return this.toResponseDto(result.rows[0]);
  }

  async update(id: number, data: UpdateTransactionDto): Promise<TransactionResponseDto | null> {
    const pool = getPostgreSQLPool();
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.type) {
      updates.push(`type = $${paramIndex++}`);
      values.push(data.type);
    }

    if (data.date) {
      updates.push(`date = $${paramIndex++}`);
      values.push(new Date(data.date));
    }

    if (data.amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      values.push(data.amount);
    }

    if (data.details !== undefined) {
      updates.push(`details = $${paramIndex++}`);
      values.push(data.details);
    }

    if (data.userId !== undefined) {
      updates.push(`user_id = $${paramIndex++}`);
      values.push(data.userId);
    }

    if (data.category) {
      updates.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE transactions SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;
    return this.toResponseDto(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}
