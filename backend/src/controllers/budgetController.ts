import { Request, Response } from 'express';

export const budgetController = {
  getAll: (req: Request, res: Response) => res.json({ message: 'Get all budgets' }),
  create: (req: Request, res: Response) => res.json({ message: 'Create budget' }),
  update: (req: Request, res: Response) => res.json({ message: `Update budget ${req.params.id}` }),
  remove: (req: Request, res: Response) => res.json({ message: `Delete budget ${req.params.id}` })
};