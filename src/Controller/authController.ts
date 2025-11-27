import { Router, Request, Response } from 'express';
import { AuthService } from '../Services/authService';
import { LoginDto } from '../Models/dto/userDto';
import { authMiddleware, AuthRequest } from '../Security/authMiddleware';

export const authRouter = Router();
const authService = new AuthService();

// POST /auth/login - Realiza login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const credentials: LoginDto = req.body;
    const result = await authService.login(credentials);
    
    res.status(200).json({
      message: 'Login realizado com sucesso',
      ...result,
    });
  } catch (error: any) {
    res.status(401).json({ 
      message: error.message || 'Erro ao realizar login' 
    });
  }
});

// POST /auth/logout - Realiza logout
authRouter.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Extrai o token do header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || '';

    await authService.logout(token);
    
    res.status(200).json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: error.message || 'Erro ao realizar logout' 
    });
  }
});

