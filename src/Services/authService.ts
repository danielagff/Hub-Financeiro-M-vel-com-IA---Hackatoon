import { IAuthService, LoginResponse } from './InterfacesServices/authService';
import { LoginDto } from '../Models/dto/userDto';
import { getPostgreSQLPool } from '../Utils/postgresql';
import { comparePassword } from '../Security/bcrypt';
import { generateToken } from '../Security/jwt';

export class AuthService implements IAuthService {
  async login(credentials: LoginDto): Promise<LoginResponse> {
    if (!credentials.email || !credentials.email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!credentials.password || credentials.password.length === 0) {
      throw new Error('Senha é obrigatória');
    }

    const pool = getPostgreSQLPool();
    const result = await pool.query(
      'SELECT id, name, email, type, password FROM users WHERE LOWER(email) = LOWER($1)',
      [credentials.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Email ou senha inválidos');
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos');
    }

    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
    });

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
    if (!token || token.trim().length === 0) {
      throw new Error('Token inválido');
    }
    return Promise.resolve();
  }
}

