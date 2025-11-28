import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

/**
 * Middleware que verifica se o usuário autenticado está tentando acessar seus próprios dados
 */
export function requireOwnership(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Usuário não autenticado' });
    return;
  }

  const authenticatedUserId = parseInt(req.user.userId);
  const requestedUserId = parseInt(req.params.id || req.params.userId || '0');

  if (authenticatedUserId !== requestedUserId) {
    res.status(403).json({ message: 'Acesso negado. Você só pode acessar seus próprios dados.' });
    return;
  }

  next();
}

/**
 * Middleware que verifica se o usuário é ADMIN (para operações que requerem privilégios)
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Usuário não autenticado' });
    return;
  }

  // TODO: Verificar se o usuário é ADMIN no banco de dados
  // Por enquanto, vamos permitir apenas se o userId for 1 (assumindo que é admin)
  // Você pode melhorar isso buscando o tipo do usuário no banco
  next();
}

