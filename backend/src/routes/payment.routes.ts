import { Router } from 'express';
import { updatePaymentStatus } from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.patch('/:id/status', updatePaymentStatus);

export default router;
