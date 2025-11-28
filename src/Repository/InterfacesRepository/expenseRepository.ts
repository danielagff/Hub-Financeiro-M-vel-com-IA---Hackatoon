import { CreateExpenseDto, UpdateExpenseDto, ExpenseResponseDto } from '../../Models/dto/expenseDto';

export interface IExpenseRepository {
  findAll(): Promise<ExpenseResponseDto[]>;
  findById(id: number): Promise<ExpenseResponseDto | null>;
  findByUserId(userId: number): Promise<ExpenseResponseDto[]>;
  findByUserIdAndStatus(userId: number, status: string): Promise<ExpenseResponseDto[]>;
  create(data: CreateExpenseDto): Promise<ExpenseResponseDto>;
  update(id: number, data: UpdateExpenseDto): Promise<ExpenseResponseDto | null>;
  delete(id: number): Promise<boolean>;
}
