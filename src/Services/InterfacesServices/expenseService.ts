import { CreateExpenseDto, UpdateExpenseDto, ExpenseResponseDto } from '../../Models/dto/expenseDto';

export interface IExpenseService {
  getAllExpenses(): Promise<ExpenseResponseDto[]>;
  getExpenseById(id: number): Promise<ExpenseResponseDto | null>;
  getExpensesByUserId(userId: number): Promise<ExpenseResponseDto[]>;
  getExpensesByUserIdAndStatus(userId: number, status: string): Promise<ExpenseResponseDto[]>;
  createExpense(data: CreateExpenseDto): Promise<ExpenseResponseDto>;
  updateExpense(id: number, data: UpdateExpenseDto): Promise<ExpenseResponseDto | null>;
  deleteExpense(id: number): Promise<boolean>;
}
