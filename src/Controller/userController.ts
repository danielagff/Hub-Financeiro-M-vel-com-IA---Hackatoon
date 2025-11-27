import { Router, Request, Response } from 'express';
import { UserService } from '../Services/userService';
import { CreateUserDto, UpdateUserDto } from '../Models/dto/userDto';

export const userRouter = Router();
const userService = new UserService();

// GET /users - Lista todos os usuários
userRouter.get('/', async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erro ao buscar usuários' });
  }
});

// GET /users/:id - Busca usuário por ID
userRouter.get('/:id', async (req: Request, res: Response) => {
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

// GET /users/email/:email - Busca usuário por email
userRouter.get('/email/:email', async (req: Request, res: Response) => {
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

// GET /users/pix/:chavePix - Busca usuário por Chave PIX
userRouter.get('/pix/:chavePix', async (req: Request, res: Response) => {
  try {
    const chavePix = req.params.chavePix;
    const user = await userService.getUserByChavePix(chavePix);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao buscar usuário' });
  }
});

// POST /users - Cria novo usuário
userRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDto = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao criar usuário' });
  }
});

// PUT /users/:id - Atualiza usuário
userRouter.put('/:id', async (req: Request, res: Response) => {
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

// DELETE /users/:id - Deleta usuário
userRouter.delete('/:id', async (req: Request, res: Response) => {
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

