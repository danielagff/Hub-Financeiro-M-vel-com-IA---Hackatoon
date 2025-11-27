import { LoginDto } from '../../Models/dto/userDto';

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    type: string;
  };
  token: string;
}

export interface IAuthService {
  login(credentials: LoginDto): Promise<LoginResponse>;
  logout(token: string): Promise<void>;
}

