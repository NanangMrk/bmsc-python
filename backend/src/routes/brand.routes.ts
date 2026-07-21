import { Router } from 'express';
import { getBrands } from '../controllers/brand.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/', getBrands);

export default router;
