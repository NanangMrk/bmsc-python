import { Router } from 'express';
import { getUsers, createUser, updateUserAccess, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.post('/', createUser);
router.post('/:id/access', updateUserAccess);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
