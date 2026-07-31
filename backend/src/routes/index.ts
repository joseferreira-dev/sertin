import { Router } from 'express';
import authRoutes from './auth';
import accountRoutes from './accounts';
import categoryRoutes from './categories';
import transactionRoutes from './transactions';
import tagRoutes from './tags';
import budgetRoutes from './budgets';
import goalRoutes from './goals';
import reportRoutes from './reports';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/tags', tagRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/reports', reportRoutes);

export default router;