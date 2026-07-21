import { Router } from 'express';
import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } from '../controllers/bankAccount.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getBankAccounts); // public read so PaymentTab can fetch without issues
router.use(authenticateToken);
router.post('/', createBankAccount);
router.patch('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);

export default router;
