import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All dashboard endpoints require authentication
router.use(authenticateToken);

// GET /api/dashboard
router.get('/', getDashboardStats);

export default router;
