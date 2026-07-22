import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getBankAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return res.json(accounts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { bankName, accountNumber, accountName, isActive } = req.body;
    const account = await prisma.bankAccount.create({
      data: { bankName, accountNumber, accountName, isActive: isActive ?? true }
    });
    return res.json(account);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const account = await prisma.bankAccount.update({ where: { id }, data });
    return res.json(account);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.bankAccount.delete({ where: { id } });
    return res.json({ message: 'Deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
