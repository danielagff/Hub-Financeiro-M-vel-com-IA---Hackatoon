import { IUserService } from './InterfacesServices/userService';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../Models/dto/userDto';
import { IUserRepository } from '../Repository/InterfacesRepository/userRepository';
import { UserRepository } from '../Repository/userRepository';

export class UserService implements IUserService {
  private repository: IUserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    return await this.repository.findAll();
  }

  async getUserById(id: number): Promise<UserResponseDto | null> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }
    return await this.repository.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }
    return await this.repository.findByEmail(email);
  }

  async getUserByPixKey(key: string): Promise<UserResponseDto | null> {
    if (!key || key.trim().length === 0) {
      throw new Error('Chave PIX inválida');
    }
    return await this.repository.findByPixKey(key);
  }

  async addPixKey(userId: number, pixKey: { type: string; key: string }): Promise<UserResponseDto> {
    if (!userId || userId <= 0) throw new Error('UserId inválido');
    if (!pixKey || !pixKey.key || pixKey.key.trim().length === 0) throw new Error('Chave inválida');

    const user = await this.repository.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');

    // check if key already exists globally
    const existing = await this.repository.findByPixKey(pixKey.key);
    if (existing) throw new Error('Chave PIX já cadastrada');

    await this.repository.addPixKey(userId, pixKey);
    // return updated user with pix keys
    return (await this.repository.findById(userId)) as UserResponseDto;
  }

  async removePixKey(userId: number, key: string): Promise<boolean> {
    if (!userId || userId <= 0) throw new Error('UserId inválido');
    if (!key || key.trim().length === 0) throw new Error('Chave inválida');

    const user = await this.repository.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');

    return await this.repository.removePixKey(userId, key);
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const existingUserByEmail = await this.repository.findByEmail(data.email);
    if (existingUserByEmail) {
      throw new Error('Email já cadastrado');
    }

    // ensure none of the provided keys are already registered
    for (const pk of data.pixKeys || []) {
      const existing = await this.repository.findByPixKey(pk.key);
      if (existing) {
        throw new Error(`Chave PIX já cadastrada: ${pk.key}`);
      }
    }
    if (data.balance !== undefined && data.balance < 0) {
      throw new Error('Balance não pode ser negativo');
    }

    if (data.creditScore !== undefined && (data.creditScore < 0 || data.creditScore > 1000)) {
      throw new Error('CreditScore deve estar entre 0 e 1000');
    }

    return await this.repository.create(data);
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<UserResponseDto | null> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    if (data.email) {
      if (!data.email.includes('@')) {
        throw new Error('Email inválido');
      }
      const userWithEmail = await this.repository.findByEmail(data.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Email já está em uso por outro usuário');
      }
    }

    if (data.pixKeys) {
      for (const pk of data.pixKeys) {
        const userWithPix = await this.repository.findByPixKey(pk.key);
        if (userWithPix && userWithPix.id !== id) {
          throw new Error(`Chave PIX já está em uso por outro usuário: ${pk.key}`);
        }
      }
    }

    if (data.password && data.password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    if (data.balance !== undefined && data.balance < 0) {
      throw new Error('Balance não pode ser negativo');
    }

    if (data.creditScore !== undefined && (data.creditScore < 0 || data.creditScore > 1000)) {
      throw new Error('CreditScore deve estar entre 0 e 1000');
    }

    return await this.repository.update(id, data);
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return await this.repository.delete(id);
  }
}

