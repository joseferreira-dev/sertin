import { Request, Response } from 'express';

export const tagController = {
  getAll: (req: Request, res: Response) => res.json({ message: 'Get all tags' }),
  create: (req: Request, res: Response) => res.json({ message: 'Create tag' }),
  update: (req: Request, res: Response) => res.json({ message: `Update tag ${req.params.id}` }),
  remove: (req: Request, res: Response) => res.json({ message: `Delete tag ${req.params.id}` })
};