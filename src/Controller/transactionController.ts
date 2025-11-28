import { Router, Request, Response } from 'express';
import { TransactionService } from '../Services/transactionService';
import { CreateTransactionDto, UpdateTransactionDto } from '../Models/dto/transactionDto';

export const transactionRouter = Router();
const transactionService = new TransactionService();

transactionRouter.get('/', async (req: Request, res: Response) => {
  try {
    const txs = await transactionService.getAllTransactions();
    res.status(200).json(txs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao buscar transações' });
  }
});

transactionRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const tx = await transactionService.getTransactionById(id);
    if (!tx) return res.status(404).json({ message: 'Transação não encontrada' });
    res.status(200).json(tx);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar transação' });
  }
});

transactionRouter.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const txs = await transactionService.getTransactionsByUserId(userId);
    res.status(200).json(txs);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar transações do usuário' });
  }
});

transactionRouter.post('/', async (req: Request, res: Response) => {
  try {
    const data: CreateTransactionDto = req.body;
    const created = await transactionService.createTransaction(data);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao criar transação' });
  }
});

transactionRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data: UpdateTransactionDto = req.body;
    const updated = await transactionService.updateTransaction(id, data);
    if (!updated) return res.status(404).json({ message: 'Transação não encontrada' });
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao atualizar transação' });
  }
});

transactionRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await transactionService.deleteTransaction(id);
    if (!deleted) return res.status(404).json({ message: 'Transação não encontrada' });
    res.status(200).json({ message: 'Transação deletada com sucesso' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao deletar transação' });
  }
});
