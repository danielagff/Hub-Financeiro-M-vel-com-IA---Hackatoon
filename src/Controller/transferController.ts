import { Router, Request, Response } from 'express';
import { TransferService } from '../Services/transferService';
import { CreateTransferDto } from '../Models/dto/transferDto';
import { authMiddleware, AuthRequest } from '../Security/authMiddleware';

export const transferRouter = Router();
const transferService = new TransferService();

/**
 * @swagger
 * /transfers/pix:
 *   post:
 *     summary: Realizar transferência PIX
 *     tags: [Transferências]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransferPIX'
 *     responses:
 *       201:
 *         description: Transferência realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferResponse'
 *       400:
 *         description: Erro na transferência (saldo insuficiente, chave inválida, etc)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
transferRouter.post('/pix', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const data: CreateTransferDto = {
      ...req.body,
      fromUserId: parseInt(req.user.userId), // Sempre usar o userId do token
    };

    const result = await transferService.transferPix(data);
    res.status(201).json({
      message: 'Transferência realizada com sucesso',
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erro ao realizar transferência' });
  }
});

