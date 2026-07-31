import { Request, Response } from 'express';

export const accountController = {
  getAll: (req: Request, res: Response) => res.json({ message: 'Get all accounts' }),
  getOne: (req: Request, res: Response) => res.json({ message: `Get account ${req.params.id}` }),
  create: (req: Request, res: Response) => res.json({ message: 'Create account' }),
  update: (req: Request, res: Response) => res.json({ message: `Update account ${req.params.id}` }),
  remove: (req: Request, res: Response) => res.json({ message: `Delete account ${req.params.id}` })
};