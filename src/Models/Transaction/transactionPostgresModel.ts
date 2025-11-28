import { TransactionType } from '../enums/transactionType';
import { TransactionCategory } from '../enums/transactionCategory';

export interface ITransactionPostgres {
  id: number;
  type: TransactionType | string;
  date: Date;
  amount: string; // TODO - Trocar para algum tipo númerico adequado para valores monetários 
  details: string | null;
  user_id: number;
  category: TransactionCategory | string;
  created_at: Date;
  updated_at: Date;
}
