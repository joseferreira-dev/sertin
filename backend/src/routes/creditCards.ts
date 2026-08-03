import { Router } from 'express';
import { creditCardController } from '../controllers/creditCardController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', creditCardController.getAll);
router.get('/:id', creditCardController.getOne);
router.post('/', creditCardController.create);
router.put('/:id', creditCardController.update);
router.delete('/:id', creditCardController.remove);

export default router;
