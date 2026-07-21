import { Router } from 'express';
import { createShipment, updateShipment, deleteShipment } from '../controllers/shipment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.post('/', createShipment);
router.patch('/:id', updateShipment);
router.delete('/:id', deleteShipment);

export default router;
