import { Router } from 'express';
import { getScripts, saveScripts, addRowComment, deleteRowComment } from '../controllers/script.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateToken);
router.get('/', getScripts);
router.post('/save', saveScripts);
router.post('/rows/:rowId/comments', addRowComment);
router.delete('/rows/:rowId/comments/:commentId', deleteRowComment);

export default router;
