import { Router } from 'express';
import { getChatMessages, sendChatMessage } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/:projectId', getChatMessages);
router.post('/:projectId', sendChatMessage);

export default router;
