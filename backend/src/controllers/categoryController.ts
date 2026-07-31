import { Request, Response } from 'express';

export const categoryController = {
  getAll: (req: Request, res: Response) => res.json({ message: 'Get all categories' }),
  create: (req: Request, res: Response) => res.json({ message: 'Create category' }),
  update: (req: Request, res: Response) => res.json({ message: `Update category ${req.params.id}` }),
  remove: (req: Request, res: Response) => res.json({ message: `Delete category ${req.params.id}` })
};