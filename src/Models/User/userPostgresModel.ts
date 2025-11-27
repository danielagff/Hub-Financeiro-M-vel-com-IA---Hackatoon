// Interface para User no PostgreSQL
import { UserType } from '../enums/userType';

export interface IUserPostgres {
  id: number;
  type: UserType | string;
  name: string;
  email: string;
  chave_pix: string;
  password: string;
  balance: number;
  credit_score: number;
  configuration: { [key: string]: any };
  ia_agent_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

