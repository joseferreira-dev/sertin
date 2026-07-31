import { Request, Response } from 'express';

export const transactionController = {
  getAll: (req: Request, res: Response) => res.json({ message: 'Get all transactions' }),
  create: (req: Request, res: Response) => res.json({ message: 'Create transaction' }),
  update: (req: Request, res: Response) => res.json({ message: `Update transaction ${req.params.id}` }),
  remove: (req: Request, res: Response) => res.json({ message: `Delete transaction ${req.params.id}` })
};