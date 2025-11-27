import { Router, Request, Response } from 'express';

export const pingRouter = Router();

pingRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'pong' });
});



