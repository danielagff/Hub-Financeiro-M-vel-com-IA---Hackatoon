import { IAuthService, LoginResponse } from './InterfacesServices/authService';
import { LoginDto } from '../Models/dto/userDto';
import { getPostgreSQLPool } from '../Utils/postgresql';
import { comparePassword } from '../Security/bcrypt';
import { generateToken } from '../Security/jwt';

export class AuthService implements IAuthService {
  async login(credentials: LoginDto): Promise<LoginResponse> {
    // Validações
    if (!credentials.email || !credentials.email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!credentials.password || credentials.password.length === 0) {
      throw new Error('Senha é obrigatória');
    }

    // Busca o usuário pelo email no PostgreSQL (incluindo a senha)
    const pool = getPostgreSQLPool();
    const result = await pool.query(
      'SELECT id, name, email, type, password FROM users WHERE LOWER(email) = LOWER($1)',
      [credentials.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Email ou senha inválidos');
    }

    const user = result.rows[0];

    // Compara a senha fornecida com a senha criptografada
    const isPasswordValid = await comparePassword(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos');
    }

    // Gera o token JWT
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
    });

    // Retorna os dados do usuário e o token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
      token,
    };
  }

  async logout(token: string): Promise<void> {
    // Validação básica do token
    if (!token || token.trim().length === 0) {
      throw new Error('Token inválido');
    }

    // Em uma implementação completa, você poderia:
    // 1. Adicionar o token a uma blacklist (Redis/MongoDB)
    // 2. Invalidar o token no banco de dados
    // 3. Registrar o logout em logs
    
    // Por enquanto, apenas valida que o token foi fornecido
    // O logout efetivo é feito no cliente removendo o token
    return Promise.resolve();
  }
}

