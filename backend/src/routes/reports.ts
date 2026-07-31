import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);
router.get('/expenses-by-category', reportController.expensesByCategory);
router.get('/dre', reportController.dre);
router.get('/projection', reportController.projection);

export default router;