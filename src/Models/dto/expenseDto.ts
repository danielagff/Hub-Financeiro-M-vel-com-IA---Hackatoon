import { ExpenseStatus } from '../enums/expenseStatus';

export interface CreateExpenseDto {
  userId: number;
  isRecurringPayment: boolean;
  isActive: boolean;
  amount: number;
  description: string;
  executionDate: string | Date;
  status?: ExpenseStatus;
}

export interface UpdateExpenseDto {
  isRecurringPayment?: boolean;
  isActive?: boolean;
  amount?: number;
  description?: string;
  executionDate?: string | Date;
  status?: ExpenseStatus;
}

export interface ExpenseResponseDto {
  id: number;
  userId: number;
  isRecurringPayment: boolean;
  isActive: boolean;
  amount: number;
  description: string;
  executionDate: Date;
  status: ExpenseStatus | string;
  createdAt: Date;
  updatedAt: Date;
}
