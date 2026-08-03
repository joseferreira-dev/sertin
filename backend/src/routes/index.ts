import { Router } from 'express';
import authRoutes from './auth';
import accountRoutes from './accounts';
import creditCardRoutes from './creditCards';
import categoryRoutes from './categories';
import transactionRoutes from './transactions';
import installmentRoutes from './installments';
import tagRoutes from './tags';
import budgetRoutes from './budgets';
import goalRoutes from './goals';
import reportRoutes from './reports';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/credit-cards', creditCardRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/installments', installmentRoutes);
router.use('/tags', tagRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/reports', reportRoutes);

export default router;
