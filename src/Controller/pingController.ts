import { Router, Request, Response } from 'express';

export const pingRouter = Router();

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Verificar se a API está funcionando
 *     tags: [Health Check]
 *     security: []
 *     responses:
 *       200:
 *         description: API funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
pingRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'pong' });
});




