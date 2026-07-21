import { Router } from 'express';
import { getPlatforms, createPlatform, updatePlatform, deletePlatform } from '../controllers/platform.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getPlatforms);
router.post('/', createPlatform);
router.put('/:id', updatePlatform);
router.delete('/:id', deletePlatform);

export default router;
