import { ITransactionService } from './InterfacesServices/transactionService';
import { CreateTransactionDto, UpdateTransactionDto, TransactionResponseDto } from '../Models/dto/transactionDto';
import { ITransactionRepository } from '../Repository/InterfacesRepository/transactionRepository';
import { TransactionRepository } from '../Repository/transactionRepository';
import { UserRepository } from '../Repository/userRepository';

export class TransactionService implements ITransactionService {
  private repository: ITransactionRepository;
  private userRepository: UserRepository;

  constructor() {
    this.repository = new TransactionRepository();
    this.userRepository = new UserRepository();
  }

  async getAllTransactions(): Promise<TransactionResponseDto[]> {
    return await this.repository.findAll();
  }

  async getTransactionById(id: number): Promise<TransactionResponseDto | null> {
    if (!id || id <= 0) throw new Error('ID inválido');
    return await this.repository.findById(id);
  }

  async getTransactionsByUserId(userId: number): Promise<TransactionResponseDto[]> {
    if (!userId || userId <= 0) throw new Error('UserId inválido');
    return await this.repository.findByUserId(userId);
  }

  async createTransaction(data: CreateTransactionDto): Promise<TransactionResponseDto> {
    if (!data.userId || data.userId <= 0) throw new Error('UserId inválido');
    if (!data.type) throw new Error('Type é obrigatório');
    if (data.amount === undefined || data.amount === null || data.amount <= 0) throw new Error('Amount deve ser maior que 0');

    // Optional: validate user exists
    const user = await this.userRepository.findById(data.userId);
    if (!user) throw new Error('Usuário não encontrado');

    return await this.repository.create(data);
  }

  async updateTransaction(id: number, data: UpdateTransactionDto): Promise<TransactionResponseDto | null> {
    if (!id || id <= 0) throw new Error('ID inválido');
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Transação não encontrada');

    if (data.userId !== undefined && data.userId !== existing.userId) {
      const user = await this.userRepository.findById(data.userId as number);
      if (!user) throw new Error('Usuário informado não existe');
    }

    if (data.amount !== undefined && data.amount <= 0) throw new Error('Amount deve ser maior que 0');

    return await this.repository.update(id, data);
  }

  async deleteTransaction(id: number): Promise<boolean> {
    if (!id || id <= 0) throw new Error('ID inválido');
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Transação não encontrada');
    return await this.repository.delete(id);
  }
}
