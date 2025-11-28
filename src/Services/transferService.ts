import { ITransferService } from './InterfacesServices/transferService';
import { CreateTransferDto, TransferResponseDto } from '../Models/dto/transferDto';
import { UserRepository } from '../Repository/userRepository';
import { TransactionRepository } from '../Repository/transactionRepository';
import { getPostgreSQLPool } from '../Utils/postgresql';
import { TransactionType } from '../Models/enums/transactionType';
import { TransactionCategory } from '../Models/enums/transactionCategory';

export class TransferService implements ITransferService {
  private userRepository: UserRepository;
  private transactionRepository: TransactionRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.transactionRepository = new TransactionRepository();
  }

  async transferPix(data: CreateTransferDto): Promise<TransferResponseDto> {
    // Validações iniciais
    if (!data.fromUserId || data.fromUserId <= 0) {
      throw new Error('ID do remetente inválido');
    }

    if (!data.toPixKey || data.toPixKey.trim().length === 0) {
      throw new Error('Chave PIX do destinatário é obrigatória');
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error('Valor da transferência deve ser maior que zero');
    }

    // Buscar usuário remetente
    const fromUser = await this.userRepository.findById(data.fromUserId);
    if (!fromUser) {
      throw new Error('Usuário remetente não encontrado');
    }

    // Buscar usuário destinatário pela chave PIX
    const toUser = await this.userRepository.findByPixKey(data.toPixKey);
    if (!toUser) {
      throw new Error('Chave PIX não encontrada');
    }

    if (fromUser.id === toUser.id) {
      throw new Error('Não é possível transferir para si mesmo');
    }

    // Validar saldo suficiente
    if (fromUser.balance < data.amount) {
      throw new Error('Saldo insuficiente');
    }

    // Usar transação do banco para garantir atomicidade
    const pool = getPostgreSQLPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Calcular novos saldos
      const newFromBalance = fromUser.balance - data.amount;
      const newToBalance = toUser.balance + data.amount;

      // Atualizar saldo do remetente
      await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newFromBalance, fromUser.id]);

      // Atualizar saldo do destinatário
      await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newToBalance, toUser.id]);

      // Criar transação de débito para o remetente
      const debitTransaction = await client.query(
        `INSERT INTO transactions (type, date, amount, details, user_id, category)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          TransactionType.DEBIT,
          new Date(),
          data.amount,
          data.description || `Transferência PIX para ${toUser.name}`,
          fromUser.id,
          TransactionCategory.OTHER,
        ]
      );

      // Criar transação de crédito para o destinatário
      const creditTransaction = await client.query(
        `INSERT INTO transactions (type, date, amount, details, user_id, category)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          TransactionType.CREDIT,
          new Date(),
          data.amount,
          data.description || `Transferência PIX de ${fromUser.name}`,
          toUser.id,
          TransactionCategory.OTHER,
        ]
      );

      // Criar registro da transferência (opcional - se quiser uma tabela específica)
      // Por enquanto, vamos retornar os dados da transferência

      await client.query('COMMIT');

      return {
        id: 0, // Se criar tabela de transfers, usar o ID retornado
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount: data.amount,
        description: data.description,
        debitTransactionId: debitTransaction.rows[0].id,
        creditTransactionId: creditTransaction.rows[0].id,
        createdAt: new Date(),
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw new Error(`Erro ao realizar transferência: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

