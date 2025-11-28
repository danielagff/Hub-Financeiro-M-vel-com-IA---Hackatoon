import { IUserRepository } from './InterfacesRepository/userRepository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../Models/dto/userDto';
import { getPostgreSQLPool } from '../Utils/postgresql';
import { hashPassword } from '../Security/bcrypt';
import { UserModel } from '../Models/User/userModel';

export class UserRepository implements IUserRepository {
  private toResponseDto(row: any, iaAgent?: any): UserResponseDto {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      email: row.email,
      pixKeys: [],
      balance: parseFloat(row.balance),
      creditScore: row.credit_score,
      configuration: row.configuration || {},
      iaAgent: iaAgent || { attributes: {} },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async getPixKeys(userId: number): Promise<{ type: string; key: string }[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT type, key FROM user_pix_keys WHERE user_id = $1', [userId]);
    return result.rows.map((r: any) => ({ type: r.type, key: r.key }));
  }

  private async getIAAgent(iaAgentId: string | null): Promise<any> {
    if (!iaAgentId) {
      return { attributes: {} };
    }

    try {
      const iaAgent = await UserModel.findById(iaAgentId).exec();
      if (iaAgent && (iaAgent as any).iaAgent) {
        const attrs = (iaAgent as any).iaAgent.attributes;
        return {
          attributes: attrs instanceof Map ? Object.fromEntries(attrs) : (attrs || {}),
        };
      }
    } catch (error) {
      console.warn('IAAgent not found in MongoDB:', iaAgentId);
    }

    return { attributes: {} };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    
    const users: UserResponseDto[] = [];
    for (const row of result.rows) {
      const iaAgent = await this.getIAAgent(row.ia_agent_id);
      const dto = this.toResponseDto(row, iaAgent);
      dto.pixKeys = await this.getPixKeys(row.id);
      users.push(dto);
    }
    
    return users;
  }

  async findById(id: number): Promise<UserResponseDto | null> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const iaAgent = await this.getIAAgent(row.ia_agent_id);
    const dto = this.toResponseDto(row, iaAgent);
    dto.pixKeys = await this.getPixKeys(row.id);
    return dto;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const iaAgent = await this.getIAAgent(row.ia_agent_id);
    const dto = this.toResponseDto(row, iaAgent);
    dto.pixKeys = await this.getPixKeys(row.id);
    return dto;
  }

  async findByPixKey(key: string): Promise<UserResponseDto | null> {
    const pool = getPostgreSQLPool();
    const result = await pool.query(
      'SELECT u.* FROM users u JOIN user_pix_keys k ON u.id = k.user_id WHERE k.key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const iaAgent = await this.getIAAgent(row.ia_agent_id);
    const dto = this.toResponseDto(row, iaAgent);
    dto.pixKeys = await this.getPixKeys(row.id);
    return dto;
  }

  async addPixKey(userId: number, pixKey: { type: string; key: string }): Promise<void> {
    const pool = getPostgreSQLPool();
    await pool.query('INSERT INTO user_pix_keys (user_id, type, key) VALUES ($1, $2, $3)', [userId, pixKey.type, pixKey.key]);
  }

  async removePixKey(userId: number, key: string): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('DELETE FROM user_pix_keys WHERE user_id = $1 AND key = $2', [userId, key]);
    return (result.rowCount || 0) > 0;
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const pool = getPostgreSQLPool();
    const hashedPassword = await hashPassword(data.password);
    let iaAgentId: string | null = null;
    if (data.iaAgent && Object.keys(data.iaAgent.attributes || {}).length > 0) {
      const iaAgentDoc = new UserModel({
        iaAgent: {
          attributes: data.iaAgent.attributes,
        },
      });
      const saved = await iaAgentDoc.save();
      iaAgentId = saved._id.toString();
    }

    const result = await pool.query(
      `INSERT INTO users (type, name, email, password, balance, credit_score, configuration, ia_agent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.type || 'NORMAL',
        data.name,
        data.email.toLowerCase(),
        hashedPassword,
        data.balance || 0,
        data.creditScore || 0,
        JSON.stringify(data.configuration || {}),
        iaAgentId,
      ]
    );

    const row = result.rows[0];
    const iaAgent = await this.getIAAgent(row.ia_agent_id);
    const dto = this.toResponseDto(row, iaAgent);
    dto.pixKeys = await this.getPixKeys(row.id);
    return dto;
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto | null> {
    const pool = getPostgreSQLPool();
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email.toLowerCase());
    }

    const pixKeysToReplace = data.pixKeys;

    if (data.password) {
      const hashedPassword = await hashPassword(data.password);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (data.type) {
      updates.push(`type = $${paramIndex++}`);
      values.push(data.type);
    }

    if (data.balance !== undefined) {
      updates.push(`balance = $${paramIndex++}`);
      values.push(data.balance);
    }

    if (data.creditScore !== undefined) {
      updates.push(`credit_score = $${paramIndex++}`);
      values.push(data.creditScore);
    }

    if (data.configuration) {
      updates.push(`configuration = $${paramIndex++}`);
      values.push(JSON.stringify(data.configuration));
    }

    if (data.iaAgent) {
      const currentUser = await pool.query('SELECT ia_agent_id FROM users WHERE id = $1', [id]);
      
      if (currentUser.rows[0]?.ia_agent_id) {
        await UserModel.findByIdAndUpdate(
          currentUser.rows[0].ia_agent_id,
          { iaAgent: { attributes: data.iaAgent.attributes } }
        );
      } else {
        const iaAgentDoc = new UserModel({
          iaAgent: {
            attributes: data.iaAgent.attributes,
          },
        });
        const saved = await iaAgentDoc.save();
        updates.push(`ia_agent_id = $${paramIndex++}`);
        values.push(saved._id.toString());
      }
    }

    if (pixKeysToReplace) {
      await pool.query('DELETE FROM user_pix_keys WHERE user_id = $1', [id]);
      for (const pk of pixKeysToReplace) {
        try {
          await pool.query('INSERT INTO user_pix_keys (user_id, type, key) VALUES ($1, $2, $3)', [id, pk.type, pk.key]);
        } catch (err) {
          console.warn('Failed to upsert pix key during update', pk, err);
        }
      }
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const iaAgent = await this.getIAAgent(row.ia_agent_id);
    return this.toResponseDto(row, iaAgent);
  }

  async delete(id: number): Promise<boolean> {
    const pool = getPostgreSQLPool();
    const user = await pool.query('SELECT ia_agent_id FROM users WHERE id = $1', [id]);
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    if (user.rows[0]?.ia_agent_id) {
      try {
        await UserModel.findByIdAndDelete(user.rows[0].ia_agent_id);
      } catch (error) {
        console.warn('Error deleting IAAgent from MongoDB:', error);
      }
    }
    
    return (result.rowCount || 0) > 0;
  }
}
