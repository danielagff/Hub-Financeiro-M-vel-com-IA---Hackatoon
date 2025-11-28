import { Router, Request, Response } from 'express';
import { UserService } from '../Services/userService';
import { CreateUserDto, UpdateUserDto } from '../Models/dto/userDto';
import { authMiddleware } from '../Security/authMiddleware';

export const userRouter = Router();
const userService = new UserService();

userRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao buscar usuários' });
  }
});

userRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
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

userRouter.get('/email/:email', authMiddleware, async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar usuário' });
  }
});

userRouter.get('/pix/:key', authMiddleware, async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    const user = await userService.getUserByPixKey(key);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar usuário' });
  }
});

userRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDto = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao criar usuário' });
  }
});

userRouter.post('/:id/pix', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const pix = req.body; // expect { type, key }
    const updated = await userService.addPixKey(id, pix);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao adicionar chave PIX' });
  }
});

userRouter.delete('/:id/pix/:key', authMiddleware, async (req: Request, res: Response) => {
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

userRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
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

userRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
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

