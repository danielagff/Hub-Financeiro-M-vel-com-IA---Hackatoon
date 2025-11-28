import { Router, Request, Response } from 'express';
import { TransactionService } from '../Services/transactionService';
import { CreateTransactionDto, UpdateTransactionDto } from '../Models/dto/transactionDto';
import { authMiddleware, AuthRequest } from '../Security/authMiddleware';
import { requireOwnership } from '../Security/authorizationMiddleware';

export const transactionRouter = Router();
const transactionService = new TransactionService();

// Listar todas as transações - removido por segurança (ou pode ser restrito para ADMIN)
// transactionRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const txs = await transactionService.getAllTransactions();
//     res.status(200).json(txs);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message || 'Erro ao buscar transações' });
//   }
// });

// Listar próprias transações
transactionRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const userId = parseInt(req.user.userId);
    const txs = await transactionService.getTransactionsByUserId(userId);
    res.status(200).json(txs);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar transações' });
  }
});

transactionRouter.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const id = parseInt(req.params.id);
    const tx = await transactionService.getTransactionById(id);
    if (!tx) return res.status(404).json({ message: 'Transação não encontrada' });
    
    // Verificar se a transação pertence ao usuário autenticado
    const authenticatedUserId = parseInt(req.user.userId);
    if (tx.userId !== authenticatedUserId) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode acessar suas próprias transações.' });
    }
    
    res.status(200).json(tx);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar transação' });
  }
});

transactionRouter.get('/user/:userId', authMiddleware, requireOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const txs = await transactionService.getTransactionsByUserId(userId);
    res.status(200).json(txs);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar transações do usuário' });
  }
});

transactionRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const data: CreateTransactionDto = {
      ...req.body,
      userId: parseInt(req.user.userId), // Sempre usar o userId do token
    };
    const created = await transactionService.createTransaction(data);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao criar transação' });
  }
});

transactionRouter.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const id = parseInt(req.params.id);
    const tx = await transactionService.getTransactionById(id);
    if (!tx) return res.status(404).json({ message: 'Transação não encontrada' });
    
    // Verificar se a transação pertence ao usuário autenticado
    const authenticatedUserId = parseInt(req.user.userId);
    if (tx.userId !== authenticatedUserId) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode atualizar suas próprias transações.' });
    }
    
    const data: UpdateTransactionDto = req.body;
    const updated = await transactionService.updateTransaction(id, data);
    if (!updated) return res.status(404).json({ message: 'Transação não encontrada' });
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao atualizar transação' });
  }
});

transactionRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const id = parseInt(req.params.id);
    const tx = await transactionService.getTransactionById(id);
    if (!tx) return res.status(404).json({ message: 'Transação não encontrada' });
    
    // Verificar se a transação pertence ao usuário autenticado
    const authenticatedUserId = parseInt(req.user.userId);
    if (tx.userId !== authenticatedUserId) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode deletar suas próprias transações.' });
    }
    
    const deleted = await transactionService.deleteTransaction(id);
    if (!deleted) return res.status(404).json({ message: 'Transação não encontrada' });
    res.status(200).json({ message: 'Transação deletada com sucesso' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao deletar transação' });
  }
});
