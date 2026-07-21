import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getBrands = async (req: AuthRequest, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(brands);
  } catch (error) {
    console.error('getBrands error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
