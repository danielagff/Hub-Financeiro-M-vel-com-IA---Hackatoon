import { Router, Request, Response } from 'express';
import { ExpenseService } from '../Services/expenseService';
import { CreateExpenseDto, UpdateExpenseDto } from '../Models/dto/expenseDto';
import { authMiddleware, AuthRequest } from '../Security/authMiddleware';
import { requireOwnership } from '../Security/authorizationMiddleware';

export const expenseRouter = Router();
const expenseService = new ExpenseService();

// Listar todas as despesas - removido por segurança (ou pode ser restrito para ADMIN)
// expenseRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const expenses = await expenseService.getAllExpenses();
//     res.status(200).json(expenses);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message || 'Erro ao buscar despesas' });
//   }
// });

/**
 * @swagger
 * /expenses/me:
 *   get:
 *     summary: Listar próprias despesas
 *     tags: [Despesas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de despesas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Listar próprias despesas
expenseRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const userId = parseInt(req.user.userId);
    const expenses = await expenseService.getExpensesByUserId(userId);
    res.status(200).json(expenses);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar despesas' });
  }
});

expenseRouter.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const id = parseInt(req.params.id);
    const expense = await expenseService.getExpenseById(id);
    if (!expense) return res.status(404).json({ message: 'Despesa não encontrada' });
    
    // Verificar se a despesa pertence ao usuário autenticado
    const authenticatedUserId = parseInt(req.user.userId);
    if (expense.userId !== authenticatedUserId) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode acessar suas próprias despesas.' });
    }
    
    res.status(200).json(expense);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar despesa' });
  }
});

expenseRouter.get('/user/:userId', authMiddleware, requireOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const expenses = await expenseService.getExpensesByUserId(userId);
    res.status(200).json(expenses);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar despesas do usuário' });
  }
});

expenseRouter.get('/user/:userId/status/:status', authMiddleware, requireOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const status = req.params.status.toUpperCase();
    const expenses = await expenseService.getExpensesByUserIdAndStatus(userId, status);
    res.status(200).json(expenses);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar despesas por status' });
  }
});

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Criar nova despesa
 *     tags: [Despesas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpense'
 *     responses:
 *       201:
 *         description: Despesa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Erro na validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
expenseRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const data: CreateExpenseDto = {
      ...req.body,
      userId: parseInt(req.user.userId), // Sempre usar o userId do token
    };
    const created = await expenseService.createExpense(data);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao criar despesa' });
  }
});

expenseRouter.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const id = parseInt(req.params.id);
    const expense = await expenseService.getExpenseById(id);
    if (!expense) return res.status(404).json({ message: 'Despesa não encontrada' });
    
    // Verificar se a despesa pertence ao usuário autenticado
    const authenticatedUserId = parseInt(req.user.userId);
    if (expense.userId !== authenticatedUserId) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode atualizar suas próprias despesas.' });
    }
    
    const data: UpdateExpenseDto = req.body;
    const updated = await expenseService.updateExpense(id, data);
    if (!updated) return res.status(404).json({ message: 'Despesa não encontrada' });
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao atualizar despesa' });
  }
});

expenseRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const id = parseInt(req.params.id);
    const expense = await expenseService.getExpenseById(id);
    if (!expense) return res.status(404).json({ message: 'Despesa não encontrada' });
    
    // Verificar se a despesa pertence ao usuário autenticado
    const authenticatedUserId = parseInt(req.user.userId);
    if (expense.userId !== authenticatedUserId) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode deletar suas próprias despesas.' });
    }
    
    const deleted = await expenseService.deleteExpense(id);
    if (!deleted) return res.status(404).json({ message: 'Despesa não encontrada' });
    res.status(200).json({ message: 'Despesa deletada com sucesso' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao deletar despesa' });
  }
});
