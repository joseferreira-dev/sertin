// backend/src/routes/goals.ts
import { Router } from 'express';
import { goalController } from '../controllers/goalController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', goalController.getAll);
router.get('/:id', goalController.getOne);
router.post('/', goalController.create);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.remove);
router.patch('/:id/archive', goalController.archive);
router.patch('/:id/unarchive', goalController.unarchive);

export default router;
