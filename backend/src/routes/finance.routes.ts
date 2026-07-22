import { Router } from 'express';
import { getQuotations, getQuotationById, createQuotation, updateQuotation, deleteQuotation, generateInvoice, getInvoices, createInvoice, updateInvoiceStatus, getInvoiceById, getTransactions, createTransaction, deleteTransaction } from '../controllers/finance.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/quotations/public/:id', getQuotationById);
router.get('/invoices/public/:id', getInvoiceById);

// Protected routes
router.use(authenticateToken);

// Quotations
router.get('/quotations', getQuotations);
router.get('/quotations/:id', getQuotationById);
router.post('/quotations', createQuotation);
router.patch('/quotations/:id', updateQuotation);
router.delete('/quotations/:id', deleteQuotation);
router.post('/quotations/:id/invoice', generateInvoice);

// Invoices
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);
router.patch('/invoices/:id/status', updateInvoiceStatus);

// Finance Transactions
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.delete('/transactions/:id', deleteTransaction);

export default router;
