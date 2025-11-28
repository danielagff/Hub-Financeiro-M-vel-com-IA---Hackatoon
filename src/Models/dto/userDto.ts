import { UserType } from '../enums/userType';
import { PixKeyType } from '../enums/pixKeyType';

export interface PixKeyDto {
  type: PixKeyType | string;
  key: string;
}

export interface CreateUserDto {
  name: string;
  email: string;  
  password: string;
  type?: UserType;
  balance?: number;
  creditScore?: number;
  configuration?: { [key: string]: any };
  iaAgent?: {
    attributes: { [key: string]: any };
  };
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  pixKeys?: PixKeyDto[];
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
  pixKeys: PixKeyDto[];
  balance: number;
  creditScore: number;
  configuration: { [key: string]: any };
  iaAgent: {
    attributes: { [key: string]: any };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

