import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const payment = await prisma.paymentTermin.update({
      where: { id },
      data: { status }
    });

    return res.json(payment);
  } catch (error) {
    console.error('updatePaymentStatus error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
