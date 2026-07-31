import { Request, Response } from 'express';

export const authController = {
  login: (req: Request, res: Response) => res.json({ message: 'Login' }),
  register: (req: Request, res: Response) => res.json({ message: 'Register' }),
  logout: (req: Request, res: Response) => res.json({ message: 'Logout' }),
  recover: (req: Request, res: Response) => res.json({ message: 'Recover password' })
};