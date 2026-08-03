import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Installment } from '../models/Installment';
import db from '../config/database';

export const installmentController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, startDate, endDate, accountId, creditCardId } = req.query;
      const filters: any = {};
      if (status) filters.status = String(status);
      if (startDate) filters.startDate = String(startDate);
      if (endDate) filters.endDate = String(endDate);
      if (accountId) filters.accountId = Number(accountId);
      if (creditCardId) filters.creditCardId = Number(creditCardId);

      const installments = Installment.findByUser(userId, filters);
      const result = installments.map((inst) => {
        const stmt = db.prepare(`
          SELECT COUNT(*) as total, SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as paid
          FROM transactions WHERE installment_id = ? AND user_id = ?
        `);
        const row = stmt.get(inst.id, userId) as { total: number; paid: number };
        return {
          ...inst,
          paid_installments: row.paid,
          total_installments: row.total,
        };
      });
      res.json(result);
    } catch (error: any) {
      console.error('Erro ao listar parcelamentos:', error);
      res.status(500).json({ error: 'Erro ao buscar parcelamentos' });
    }
  },

  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const installment = Installment.findById(id, userId);
      if (!installment) {
        return res.status(404).json({ error: 'Parcelamento não encontrado' });
      }
      const transactions = db
        .prepare(
          `
        SELECT * FROM transactions WHERE installment_id = ? AND user_id = ? ORDER BY date ASC
      `
        )
        .all(id, userId);
      res.json({ ...installment, transactions });
    } catch (error: any) {
      console.error('Erro ao buscar parcelamento:', error);
      res.status(500).json({ error: 'Erro ao buscar parcelamento' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        account_id,
        credit_card_id,
        category_id,
        description,
        total_amount,
        installment_count,
        start_date,
      } = req.body;

      if (!description || !total_amount || !installment_count || !start_date) {
        return res.status(400).json({
          error: 'Campos obrigatórios: description, total_amount, installment_count, start_date',
        });
      }
      if (!account_id && !credit_card_id) {
        return res.status(400).json({
          error: 'É necessário fornecer account_id ou credit_card_id',
        });
      }

      const id = Installment.create({
        user_id: userId,
        account_id: account_id || null,
        credit_card_id: credit_card_id || null,
        category_id: category_id || null,
        description,
        total_amount,
        installment_count,
        start_date,
        status: 'active',
      });

      Installment.generateTransactions(id, userId);

      const installment = Installment.findById(id, userId);
      res.status(201).json(installment);
    } catch (error: any) {
      console.error('Erro ao criar parcelamento:', error);
      res.status(500).json({ error: 'Erro ao criar parcelamento' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Installment.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Parcelamento não encontrado' });
      }

      const {
        account_id,
        credit_card_id,
        category_id,
        description,
        total_amount,
        installment_count,
        start_date,
        status,
      } = req.body;

      const updateData: any = {};
      if (account_id !== undefined) updateData.account_id = account_id || null;
      if (credit_card_id !== undefined) updateData.credit_card_id = credit_card_id || null;
      if (category_id !== undefined) updateData.category_id = category_id || null;
      if (description !== undefined) updateData.description = description;
      if (total_amount !== undefined) updateData.total_amount = total_amount;
      if (installment_count !== undefined) updateData.installment_count = installment_count;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (status !== undefined) updateData.status = status;

      Installment.update(id, userId, updateData);

      if (status === 'canceled') {
        Installment.cancelInstallment(id, userId);
      }

      const updated = Installment.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar parcelamento:', error);
      res.status(500).json({ error: 'Erro ao atualizar parcelamento' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Installment.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Parcelamento não encontrado' });
      }

      const stmt = db.prepare(
        "SELECT COUNT(*) as count FROM transactions WHERE installment_id = ? AND user_id = ? AND status = 'confirmed'"
      );
      const { count } = stmt.get(id, userId) as { count: number };
      if (count > 0) {
        return res
          .status(400)
          .json({ error: 'Não é possível excluir o parcelamento pois há parcelas já pagas.' });
      }

      db.prepare('DELETE FROM transactions WHERE installment_id = ? AND user_id = ?').run(
        id,
        userId
      );
      Installment.delete(id, userId);
      res.json({ message: 'Parcelamento excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir parcelamento:', error);
      res.status(500).json({ error: 'Erro ao excluir parcelamento' });
    }
  },

  async payInstallment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const installmentId = parseInt(String(req.params.id));
      const installmentNumber = parseInt(String(req.params.number));
      if (isNaN(installmentId) || isNaN(installmentNumber)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      Installment.payInstallment(installmentId, installmentNumber, userId);
      res.json({ message: 'Parcela paga com sucesso' });
    } catch (error: any) {
      console.error('Erro ao pagar parcela:', error);
      res.status(500).json({ error: error.message || 'Erro ao pagar parcela' });
    }
  },

  async unpayInstallment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const installmentId = parseInt(String(req.params.id));
      const installmentNumber = parseInt(String(req.params.number));
      if (isNaN(installmentId) || isNaN(installmentNumber)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      Installment.unpayInstallment(installmentId, installmentNumber, userId);
      res.json({ message: 'Pagamento desfeito com sucesso' });
    } catch (error: any) {
      console.error('Erro ao desfazer pagamento:', error);
      res.status(500).json({ error: error.message || 'Erro ao desfazer pagamento' });
    }
  },
};
