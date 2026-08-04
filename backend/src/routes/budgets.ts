import { Router } from 'express';
import { budgetController } from '../controllers/budgetController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', budgetController.getAll);
router.get('/:id', budgetController.getOne);
router.post('/', budgetController.create);
router.put('/:id', budgetController.update);
router.delete('/:id', budgetController.remove);

export default router;
