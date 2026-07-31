import { Router } from 'express';
import { goalController } from '../controllers/goalController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', goalController.getAll);
router.post('/', goalController.create);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.remove);

export default router;