import { Response } from 'express';
import { Category } from '../models/Category';
import { AuthRequest } from '../middlewares/auth';

export const categoryController = {
  // Listar todas as categorias do usuário (com subcategorias aninhadas)
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const categories = Category.findWithChildren(userId);
      res.json(categories);
    } catch (error: any) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  },

  // Obter uma categoria específica
  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const category = Category.findById(id, userId);
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      res.json(category);
    } catch (error: any) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  },

  // Criar nova categoria
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, type, color, icon, parent_id } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }

      const id = Category.create({
        user_id: userId,
        name,
        type,
        color: color || '#6366f1',
        icon: icon || 'Tag',
        parent_id: parent_id || null,
      });

      const newCategory = Category.findById(id, userId);
      res.status(201).json(newCategory);
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  },

  // Atualizar categoria
  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Category.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const { name, color, icon, parent_id } = req.body;

      Category.update(id, userId, {
        name,
        color,
        icon,
        parent_id,
      });

      const updated = Category.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  },

  // Excluir categoria (com verificação de transações)
  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Category.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      Category.delete(id, userId);
      res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      res.status(400).json({ error: error.message || 'Erro ao excluir categoria' });
    }
  },
};
