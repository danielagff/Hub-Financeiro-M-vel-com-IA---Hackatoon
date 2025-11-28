import { CreateTransferDto, TransferResponseDto } from '../../Models/dto/transferDto';

export interface ITransferService {
  transferPix(data: CreateTransferDto): Promise<TransferResponseDto>;
}

