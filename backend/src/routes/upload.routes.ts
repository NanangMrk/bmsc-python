import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware';
import { handleFileUpload, handleMultipleFileUpload } from '../controllers/upload.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/single', upload.single('file'), handleFileUpload);
router.post('/multiple', upload.array('files', 10), handleMultipleFileUpload);

export default router;
