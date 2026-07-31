import { Router } from 'express';
import { accountController } from '../controllers/accountController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', accountController.getAll);
router.get('/:id', accountController.getOne);
router.post('/', accountController.create);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.remove);

export default router;