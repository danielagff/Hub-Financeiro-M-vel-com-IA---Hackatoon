import { Router, Request, Response } from 'express';
import { UserService } from '../Services/userService';
import { CreateUserDto, UpdateUserDto } from '../Models/dto/userDto';
import { authMiddleware, AuthRequest } from '../Security/authMiddleware';
import { requireOwnership } from '../Security/authorizationMiddleware';

export const userRouter = Router();
const userService = new UserService();

// Listar todos os usuários - removido por segurança (ou pode ser restrito para ADMIN)
// userRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const users = await userService.getAllUsers();
//     res.status(200).json(users);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message || 'Erro ao buscar usuários' });
//   }
// });

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Buscar informações do próprio usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Endpoint para buscar próprio usuário (sem ID na URL)
userRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const id = parseInt(req.user.userId);
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar usuário' });
  }
});

userRouter.get('/:id', authMiddleware, requireOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar usuário' });
  }
});

// Buscar por email - removido por segurança (ou pode ser restrito)
// userRouter.get('/email/:email', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const email = req.params.email;
//     const user = await userService.getUserByEmail(email);
//     if (!user) {
//       return res.status(404).json({ message: 'Usuário não encontrado' });
//     }
//     res.status(200).json(user);
//   } catch (error: any) {
//     res.status(400).json({ message: error.message || 'Erro ao buscar usuário' });
//   }
// });

// Buscar por chave PIX - retorna apenas informações básicas para transferências
userRouter.get('/pix/:key', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const key = req.params.key;
    const user = await userService.getUserByPixKey(key);

    if (!user) {
      return res.status(404).json({ message: 'Chave PIX não encontrada' });
    }

    // Retornar apenas informações básicas necessárias para transferência
    res.status(200).json({
      id: user.id,
      name: user.name,
      pixKeys: user.pixKeys.filter(pk => pk.key === key), // Apenas a chave pesquisada
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar usuário' });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Usuários]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Erro na validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
userRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDto = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao criar usuário' });
  }
});

userRouter.post('/:id/pix', authMiddleware, requireOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const pix = req.body; // expect { type, key }
    const updated = await userService.addPixKey(id, pix);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao adicionar chave PIX' });
  }
});

userRouter.delete('/:id/pix/:key', authMiddleware, requireOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const key = req.params.key;
    const removed = await userService.removePixKey(id, key);
    if (!removed) return res.status(404).json({ message: 'Chave PIX não encontrada para esse usuário' });
    res.status(200).json({ message: 'Chave PIX removida com sucesso' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao remover chave PIX' });
  }
});

userRouter.put('/:id', authMiddleware, requireOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userData: UpdateUserDto = req.body;
    const updatedUser = await userService.updateUser(id, userData);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao atualizar usuário' });
  }
});

userRouter.delete('/:id', authMiddleware, requireOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao deletar usuário' });
  }
});

