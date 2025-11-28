import { IExpenseRepository } from './InterfacesRepository/expenseRepository';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseResponseDto } from '../Models/dto/expenseDto';
import { getPostgreSQLPool } from '../Utils/postgresql';

export class ExpenseRepository implements IExpenseRepository {
  private toResponseDto(row: any): ExpenseResponseDto {
    return {
      id: row.id,
      userId: row.user_id,
      isRecurringPayment: row.is_recurring_payment,
      isActive: row.is_active,
      amount: parseFloat(row.amount),
      description: row.description,
      executionDate: row.execution_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(): Promise<ExpenseResponseDto[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM user_expenses ORDER BY id');
    return result.rows.map((r: any) => this.toResponseDto(r));
  }

  async findById(id: number): Promise<ExpenseResponseDto | null> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM user_expenses WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.toResponseDto(result.rows[0]);
  }

  async findByUserId(userId: number): Promise<ExpenseResponseDto[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM user_expenses WHERE user_id = $1 ORDER BY execution_date DESC', [userId]);
    return result.rows.map((r: any) => this.toResponseDto(r));
  }

  async findByUserIdAndStatus(userId: number, status: string): Promise<ExpenseResponseDto[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM user_expenses WHERE user_id = $1 AND status = $2 ORDER BY execution_date DESC', [userId, status]);
    return result.rows.map((r: any) => this.toResponseDto(r));
  }

  async create(data: CreateExpenseDto): Promise<ExpenseResponseDto> {
    const pool = getPostgreSQLPool();
    const result = await pool.query(
      `INSERT INTO user_expenses (user_id, is_recurring_payment, is_active, amount, description, execution_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.userId,
        data.isRecurringPayment,
        data.isActive,
        data.amount,
        data.description,
        new Date(data.executionDate),
        data.status || 'PENDING',
      ]
    );

    return this.toResponseDto(result.rows[0]);
  }

  async update(id: number, data: UpdateExpenseDto): Promise<ExpenseResponseDto | null> {
    const pool = getPostgreSQLPool();
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.isRecurringPayment !== undefined) {
      updates.push(`is_recurring_payment = $${paramIndex++}`);
      values.push(data.isRecurringPayment);
    }

    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive);
    }

    if (data.amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      values.push(data.amount);
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    if (data.executionDate !== undefined) {
      updates.push(`execution_date = $${paramIndex++}`);
      values.push(new Date(data.executionDate));
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE user_expenses SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;
    return this.toResponseDto(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('DELETE FROM user_expenses WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}
