import { Router } from 'express';
import { installmentController } from '../controllers/installmentController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);
router.get('/', installmentController.getAll);
router.get('/:id', installmentController.getOne);
router.post('/', installmentController.create);
router.put('/:id', installmentController.update);
router.delete('/:id', installmentController.remove);
router.patch('/:id/pay/:number', installmentController.payInstallment);
router.patch('/:id/unpay/:number', installmentController.unpayInstallment);

export default router;
