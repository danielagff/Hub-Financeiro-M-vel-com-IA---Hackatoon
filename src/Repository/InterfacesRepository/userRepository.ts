import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../Models/dto/userDto';

export interface IUserRepository {
  findAll(): Promise<UserResponseDto[]>;
  findById(id: number): Promise<UserResponseDto | null>;
  findByEmail(email: string): Promise<UserResponseDto | null>;
  findByPixKey(key: string): Promise<UserResponseDto | null>;
  addPixKey(userId: number, pixKey: { type: string; key: string }): Promise<void>;
  removePixKey(userId: number, key: string): Promise<boolean>;
  create(data: CreateUserDto): Promise<UserResponseDto>;
  update(id: number, data: UpdateUserDto): Promise<UserResponseDto | null>;
  updateBalance(userId: number, newBalance: number): Promise<void>;
  delete(id: number): Promise<boolean>;
}

