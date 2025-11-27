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

  async getUserByChavePix(chavePix: string): Promise<UserResponseDto | null> {
    if (!chavePix || chavePix.trim().length === 0) {
      throw new Error('Chave PIX inválida');
    }
    return await this.repository.findByChavePix(chavePix);
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    // Validações
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!data.chavePix || data.chavePix.trim().length === 0) {
      throw new Error('Chave PIX é obrigatória');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    // Verifica se email já existe
    const existingUserByEmail = await this.repository.findByEmail(data.email);
    if (existingUserByEmail) {
      throw new Error('Email já cadastrado');
    }

    // Verifica se chave PIX já existe
    const existingUserByPix = await this.repository.findByChavePix(data.chavePix);
    if (existingUserByPix) {
      throw new Error('Chave PIX já cadastrada');
    }

    // Validações de valores numéricos
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

    // Verifica se usuário existe
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Validações condicionais
    if (data.email) {
      if (!data.email.includes('@')) {
        throw new Error('Email inválido');
      }
      // Verifica se email já está em uso por outro usuário
      const userWithEmail = await this.repository.findByEmail(data.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Email já está em uso por outro usuário');
      }
    }

    if (data.chavePix) {
      // Verifica se chave PIX já está em uso por outro usuário
      const userWithPix = await this.repository.findByChavePix(data.chavePix);
      if (userWithPix && userWithPix.id !== id) {
        throw new Error('Chave PIX já está em uso por outro usuário');
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

  // Métodos para transações e despesas (comentado por enquanto)
  // async addTransactionToUser(userId: number, transactionId: string): Promise<void> {
  //   await this.repository.addTransaction(userId, transactionId);
  // }

  // async addExpenseToUser(userId: number, expenseId: string): Promise<void> {
  //   await this.repository.addExpense(userId, expenseId);
  // }
}

