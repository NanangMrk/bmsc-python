import { Router } from 'express';
import { getRateCards, createRateCard, updateRateCard, deleteRateCard } from '../controllers/ratecard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getRateCards);
router.post('/', createRateCard);
router.put('/:id', updateRateCard);
router.delete('/:id', deleteRateCard);

export default router;
