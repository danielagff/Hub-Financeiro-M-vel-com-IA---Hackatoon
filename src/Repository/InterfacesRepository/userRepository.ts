import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../Models/dto/userDto';

export interface IUserRepository {
  findAll(): Promise<UserResponseDto[]>;
  findById(id: number): Promise<UserResponseDto | null>;
  findByEmail(email: string): Promise<UserResponseDto | null>;
  findByChavePix(chavePix: string): Promise<UserResponseDto | null>;
  create(data: CreateUserDto): Promise<UserResponseDto>;
  update(id: number, data: UpdateUserDto): Promise<UserResponseDto | null>;
  delete(id: number): Promise<boolean>;
}

