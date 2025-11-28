import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../Models/dto/userDto';

export interface IUserService {
  getAllUsers(): Promise<UserResponseDto[]>;
  getUserById(id: number): Promise<UserResponseDto | null>;
  getUserByEmail(email: string): Promise<UserResponseDto | null>;
  getUserByPixKey(key: string): Promise<UserResponseDto | null>;
  addPixKey(userId: number, pixKey: { type: string; key: string }): Promise<UserResponseDto>;
  removePixKey(userId: number, key: string): Promise<boolean>;
  createUser(data: CreateUserDto): Promise<UserResponseDto>;
  updateUser(id: number, data: UpdateUserDto): Promise<UserResponseDto | null>;
  deleteUser(id: number): Promise<boolean>;
}

