import { Router } from 'express';
import { jarController } from '../controllers/jarController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', jarController.getAll);
router.get('/:id', jarController.getOne);
router.post('/', jarController.create);
router.put('/:id', jarController.update);
router.delete('/:id', jarController.remove);

export default router;
