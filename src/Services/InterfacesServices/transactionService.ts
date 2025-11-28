import { CreateTransactionDto, UpdateTransactionDto, TransactionResponseDto } from '../../Models/dto/transactionDto';

export interface ITransactionService {
  getAllTransactions(): Promise<TransactionResponseDto[]>;
  getTransactionById(id: number): Promise<TransactionResponseDto | null>;
  getTransactionsByUserId(userId: number): Promise<TransactionResponseDto[]>;
  createTransaction(data: CreateTransactionDto): Promise<TransactionResponseDto>;
  updateTransaction(id: number, data: UpdateTransactionDto): Promise<TransactionResponseDto | null>;
  deleteTransaction(id: number): Promise<boolean>;
}
