import { IUserRepository } from './InterfacesRepository/userRepository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../Models/dto/userDto';
import { getPostgreSQLPool } from '../Utils/postgresql';
import { hashPassword } from '../Security/bcrypt';
import { UserModel } from '../Models/User/userModel'; // Para IAAgent no MongoDB

export class UserRepository implements IUserRepository {
  // Converte resultado do PostgreSQL para UserResponseDto
  private toResponseDto(row: any, iaAgent?: any): UserResponseDto {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      email: row.email,
      chavePix: row.chave_pix,
      balance: parseFloat(row.balance),
      creditScore: row.credit_score,
      // transactions: [], // Comentado por enquanto
      // expenses: [], // Comentado por enquanto
      configuration: row.configuration || {},
      iaAgent: iaAgent || { attributes: {} },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Busca IAAgent no MongoDB se houver ia_agent_id
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
      console.warn('IAAgent não encontrado no MongoDB:', iaAgentId);
    }

    return { attributes: {} };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    
    const users: UserResponseDto[] = [];
    for (const row of result.rows) {
      const iaAgent = await this.getIAAgent(row.ia_agent_id);
      users.push(this.toResponseDto(row, iaAgent));
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
    return this.toResponseDto(row, iaAgent);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const iaAgent = await this.getIAAgent(row.ia_agent_id);
    return this.toResponseDto(row, iaAgent);
  }

  async findByChavePix(chavePix: string): Promise<UserResponseDto | null> {
    const pool = getPostgreSQLPool();
    const result = await pool.query('SELECT * FROM users WHERE chave_pix = $1', [chavePix]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const iaAgent = await this.getIAAgent(row.ia_agent_id);
    return this.toResponseDto(row, iaAgent);
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const pool = getPostgreSQLPool();
    
    // Criptografa a senha
    const hashedPassword = await hashPassword(data.password);

    // Salva IAAgent no MongoDB se fornecido
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

    // Insere no PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (type, name, email, chave_pix, password, balance, credit_score, configuration, ia_agent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.type || 'NORMAL',
        data.name,
        data.email.toLowerCase(),
        data.chavePix,
        hashedPassword,
        data.balance || 0,
        data.creditScore || 0,
        JSON.stringify(data.configuration || {}),
        iaAgentId,
      ]
    );

    const row = result.rows[0];
    const iaAgent = await this.getIAAgent(row.ia_agent_id);
    return this.toResponseDto(row, iaAgent);
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto | null> {
    const pool = getPostgreSQLPool();
    
    // Monta os campos para atualização
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

    if (data.chavePix) {
      updates.push(`chave_pix = $${paramIndex++}`);
      values.push(data.chavePix);
    }

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

    // Atualiza IAAgent no MongoDB se fornecido
    if (data.iaAgent) {
      // Busca o usuário atual para pegar o ia_agent_id
      const currentUser = await pool.query('SELECT ia_agent_id FROM users WHERE id = $1', [id]);
      
      if (currentUser.rows[0]?.ia_agent_id) {
        // Atualiza o IAAgent existente
        await UserModel.findByIdAndUpdate(
          currentUser.rows[0].ia_agent_id,
          { iaAgent: { attributes: data.iaAgent.attributes } }
        );
      } else {
        // Cria novo IAAgent
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

    if (updates.length === 0) {
      // Nada para atualizar, retorna o usuário atual
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
    
    // Busca o ia_agent_id antes de deletar
    const user = await pool.query('SELECT ia_agent_id FROM users WHERE id = $1', [id]);
    
    // Deleta do PostgreSQL
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    // Deleta o IAAgent do MongoDB se existir
    if (user.rows[0]?.ia_agent_id) {
      try {
        await UserModel.findByIdAndDelete(user.rows[0].ia_agent_id);
      } catch (error) {
        console.warn('Erro ao deletar IAAgent do MongoDB:', error);
      }
    }
    
    return (result.rowCount || 0) > 0;
  }
}
