import { Request, Response } from 'express';

export const goalController = {
  getAll: (req: Request, res: Response) => res.json({ message: 'Get all goals' }),
  create: (req: Request, res: Response) => res.json({ message: 'Create goal' }),
  update: (req: Request, res: Response) => res.json({ message: `Update goal ${req.params.id}` }),
  remove: (req: Request, res: Response) => res.json({ message: `Delete goal ${req.params.id}` })
};