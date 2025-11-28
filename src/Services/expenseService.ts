import { IExpenseService } from './InterfacesServices/expenseService';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseResponseDto } from '../Models/dto/expenseDto';
import { IExpenseRepository } from '../Repository/InterfacesRepository/expenseRepository';
import { ExpenseRepository } from '../Repository/expenseRepository';
import { UserRepository } from '../Repository/userRepository';

export class ExpenseService implements IExpenseService {
  private repository: IExpenseRepository;
  private userRepository: UserRepository;

  constructor() {
    this.repository = new ExpenseRepository();
    this.userRepository = new UserRepository();
  }

  async getAllExpenses(): Promise<ExpenseResponseDto[]> {
    return await this.repository.findAll();
  }

  async getExpenseById(id: number): Promise<ExpenseResponseDto | null> {
    if (!id || id <= 0) throw new Error('ID inválido');
    return await this.repository.findById(id);
  }

  async getExpensesByUserId(userId: number): Promise<ExpenseResponseDto[]> {
    if (!userId || userId <= 0) throw new Error('UserId inválido');
    return await this.repository.findByUserId(userId);
  }

  async getExpensesByUserIdAndStatus(userId: number, status: string): Promise<ExpenseResponseDto[]> {
    if (!userId || userId <= 0) throw new Error('UserId inválido');
    if (!status || !['PENDING', 'FAILED', 'SUCCESS'].includes(status)) throw new Error('Status inválido');
    return await this.repository.findByUserIdAndStatus(userId, status);
  }

  async createExpense(data: CreateExpenseDto): Promise<ExpenseResponseDto> {
    if (!data.userId || data.userId <= 0) throw new Error('UserId inválido');
    if (data.amount === undefined || data.amount === null || data.amount <= 0) throw new Error('Amount deve ser maior que 0');
    if (!data.description || data.description.trim().length === 0) throw new Error('Description é obrigatória');
    if (data.isRecurringPayment === undefined) throw new Error('isRecurringPayment é obrigatório');
    if (data.isActive === undefined) throw new Error('isActive é obrigatório');

    // Validate user exists
    const user = await this.userRepository.findById(data.userId);
    if (!user) throw new Error('Usuário não encontrado');

    return await this.repository.create(data);
  }

  async updateExpense(id: number, data: UpdateExpenseDto): Promise<ExpenseResponseDto | null> {
    if (!id || id <= 0) throw new Error('ID inválido');
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Despesa não encontrada');

    if (data.amount !== undefined && data.amount <= 0) throw new Error('Amount deve ser maior que 0');
    if (data.description !== undefined && data.description.trim().length === 0) throw new Error('Description inválida');
    if (data.status !== undefined && !['PENDING', 'FAILED', 'SUCCESS'].includes(data.status)) throw new Error('Status inválido');

    return await this.repository.update(id, data);
  }

  async deleteExpense(id: number): Promise<boolean> {
    if (!id || id <= 0) throw new Error('ID inválido');
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Despesa não encontrada');
    return await this.repository.delete(id);
  }
}
