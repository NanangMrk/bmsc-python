import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public route to get settings (used by public invoice/quotation pages)
router.get('/', getSettings);

// Protected routes
router.use(authenticateToken);
router.patch('/', updateSettings);

export default router;
