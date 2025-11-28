import { ExpenseStatus } from '../enums/expenseStatus';

export interface IExpensePostgres {
  id: number;
  user_id: number;
  is_recurring_payment: boolean;
  is_active: boolean;
  amount: string; // stored as DECIMAL, parsed as string
  description: string;
  execution_date: Date;
  status: ExpenseStatus | string;
  created_at: Date;
  updated_at: Date;
}
