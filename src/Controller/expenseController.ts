import { Router, Request, Response } from 'express';
import { ExpenseService } from '../Services/expenseService';
import { CreateExpenseDto, UpdateExpenseDto } from '../Models/dto/expenseDto';
import { authMiddleware } from '../Security/authMiddleware';

export const expenseRouter = Router();
const expenseService = new ExpenseService();

expenseRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const expenses = await expenseService.getAllExpenses();
    res.status(200).json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao buscar despesas' });
  }
});

expenseRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const expense = await expenseService.getExpenseById(id);
    if (!expense) return res.status(404).json({ message: 'Despesa não encontrada' });
    res.status(200).json(expense);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar despesa' });
  }
});

expenseRouter.get('/user/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const expenses = await expenseService.getExpensesByUserId(userId);
    res.status(200).json(expenses);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar despesas do usuário' });
  }
});

expenseRouter.get('/user/:userId/status/:status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const status = req.params.status.toUpperCase();
    const expenses = await expenseService.getExpensesByUserIdAndStatus(userId, status);
    res.status(200).json(expenses);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar despesas por status' });
  }
});

expenseRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data: CreateExpenseDto = req.body;
    const created = await expenseService.createExpense(data);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao criar despesa' });
  }
});

expenseRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data: UpdateExpenseDto = req.body;
    const updated = await expenseService.updateExpense(id, data);
    if (!updated) return res.status(404).json({ message: 'Despesa não encontrada' });
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao atualizar despesa' });
  }
});

expenseRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await expenseService.deleteExpense(id);
    if (!deleted) return res.status(404).json({ message: 'Despesa não encontrada' });
    res.status(200).json({ message: 'Despesa deletada com sucesso' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao deletar despesa' });
  }
});
