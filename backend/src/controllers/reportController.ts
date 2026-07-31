import { Request, Response } from 'express';

export const reportController = {
  expensesByCategory: (req: Request, res: Response) => res.json({ message: 'Expenses by category' }),
  dre: (req: Request, res: Response) => res.json({ message: 'DRE' }),
  projection: (req: Request, res: Response) => res.json({ message: 'Projection' })
};