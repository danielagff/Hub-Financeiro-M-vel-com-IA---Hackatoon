export interface CreateTransferDto {
  fromUserId: number;
  toPixKey: string;
  amount: number;
  description?: string;
}

export interface TransferResponseDto {
  id: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  description?: string;
  debitTransactionId: number;
  creditTransactionId: number;
  createdAt: Date;
}

