import { CreateTransactionDto, UpdateTransactionDto, TransactionResponseDto } from '../../Models/dto/transactionDto';

export interface ITransactionRepository {
  findAll(): Promise<TransactionResponseDto[]>;
  findById(id: number): Promise<TransactionResponseDto | null>;
  findByUserId(userId: number): Promise<TransactionResponseDto[]>;
  create(data: CreateTransactionDto): Promise<TransactionResponseDto>;
  update(id: number, data: UpdateTransactionDto): Promise<TransactionResponseDto | null>;
  delete(id: number): Promise<boolean>;
}
