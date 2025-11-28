import { TransactionType } from '../enums/transactionType';
import { TransactionCategory } from '../enums/transactionCategory';

export interface CreateTransactionDto {
  type: TransactionType;
  date?: string | Date;
  amount: number;
  details?: string;
  userId: number;
  category?: TransactionCategory;
}

export interface UpdateTransactionDto {
  type?: TransactionType;
  date?: string | Date;
  amount?: number;
  details?: string;
  userId?: number;
  category?: TransactionCategory;
}

export interface TransactionResponseDto {
  id: number;
  type: TransactionType | string;
  date: Date;
  amount: number;
  details?: string;
  userId: number;
  category: TransactionCategory | string;
  createdAt: Date;
  updatedAt: Date;
}
