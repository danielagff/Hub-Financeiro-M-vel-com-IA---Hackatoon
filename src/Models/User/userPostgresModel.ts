// Interface para User no PostgreSQL
import { UserType } from '../enums/userType';
import { PixKeyType } from '../enums/pixKeyType';

export interface PixKeyPostgres {
  id: number;
  user_id: number;
  type: PixKeyType | string;
  key: string;
}

export interface IUserPostgres {
  id: number;
  type: UserType | string;
  name: string;
  email: string;
  password: string;
  balance: number;
  credit_score: number;
  configuration: { [key: string]: any };
  ia_agent_id?: string | null;
  created_at: Date;
  updated_at: Date;
}


