import { UserType } from '../enums/userType';

// DTO para criação de usuário
export interface CreateUserDto {
  name: string;
  email: string;
  chavePix: string;
  password: string;
  type?: UserType;
  balance?: number;
  creditScore?: number;
  configuration?: { [key: string]: any };
  iaAgent?: {
    attributes: { [key: string]: any };
  };
}

// DTO para atualização de usuário
export interface UpdateUserDto {
  name?: string;
  email?: string;
  chavePix?: string;
  password?: string;
  type?: UserType;
  balance?: number;
  creditScore?: number;
  configuration?: { [key: string]: any };
  iaAgent?: {
    attributes: { [key: string]: any };
  };
}

// DTO de resposta (sem senha)
export interface UserResponseDto {
  id: number;
  type: UserType;
  name: string;
  email: string;
  chavePix: string;
  balance: number;
  creditScore: number;
  // transactions?: string[]; // Comentado por enquanto
  // expenses?: string[]; // Comentado por enquanto
  configuration: { [key: string]: any };
  iaAgent: {
    attributes: { [key: string]: any };
  };
  createdAt: Date;
  updatedAt: Date;
}

// DTO para login
export interface LoginDto {
  email: string;
  password: string;
}

