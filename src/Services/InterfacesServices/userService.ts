import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../Models/dto/userDto';

export interface IUserService {
  getAllUsers(): Promise<UserResponseDto[]>;
  getUserById(id: number): Promise<UserResponseDto | null>;
  getUserByEmail(email: string): Promise<UserResponseDto | null>;
  getUserByChavePix(chavePix: string): Promise<UserResponseDto | null>;
  createUser(data: CreateUserDto): Promise<UserResponseDto>;
  updateUser(id: number, data: UpdateUserDto): Promise<UserResponseDto | null>;
  deleteUser(id: number): Promise<boolean>;
}

