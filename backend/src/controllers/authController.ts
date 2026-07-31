import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const authController = {
  // Registro
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, security_question, security_answer } = req.body;

      // Validações básicas
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
      }

      // Verificar se usuário já existe
      const existing = User.findByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
      }

      // Hash da senha
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const userId = await User.create({
        name,
        email,
        password_hash,
        security_question,
        security_answer
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: userId, email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Buscar usuário criado
      const user = User.findById(userId);

      // Registrar log
      logger.info(`Novo usuário registrado: ${email}`);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email
        }
      });
    } catch (error: any) {
      logger.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno ao criar usuário' });
    }
  },

  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
      }

      // Buscar usuário
      const user = User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const isValid = await User.comparePassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Registrar log
      logger.info(`Login realizado: ${email}`);

      res.json({
        message: 'Login bem-sucedido',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error: any) {
      logger.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno ao fazer login' });
    }
  },

  // Recuperação de senha
  async recover(req: Request, res: Response) {
    try {
      const { email, security_answer, new_password } = req.body;

      if (!email || !security_answer || !new_password) {
        return res.status(400).json({ error: 'E-mail, resposta de segurança e nova senha são obrigatórios' });
      }

      const user = User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar resposta de segurança (comparação simples, idealmente usar hash)
      if (user.security_answer !== security_answer) {
        return res.status(401).json({ error: 'Resposta de segurança incorreta' });
      }

      // Atualizar senha
      await User.updatePassword(user.id!, new_password);

      logger.info(`Senha redefinida para: ${email}`);

      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error: any) {
      logger.error('Erro na recuperação de senha:', error);
      res.status(500).json({ error: 'Erro interno ao recuperar senha' });
    }
  },

  // Logout (apenas limpa o token no frontend, mas aqui podemos registrar)
  logout(req: Request, res: Response) {
    // O logout é feito no frontend, mas podemos registrar
    logger.info(`Logout realizado`);
    res.json({ message: 'Logout realizado com sucesso' });
  }
};