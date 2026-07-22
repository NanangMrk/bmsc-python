import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getRateCards = async (req: Request, res: Response) => {
  try {
    const rateCards = await prisma.rateCard.findMany();
    return res.json(rateCards);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRateCard = async (req: Request, res: Response) => {
  try {
    const { name, platformId, price, unit, published } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const rateCard = await prisma.rateCard.create({
      data: {
        name,
        platformId: platformId || null,
        price: Number(price),
        unit,
        published: published !== undefined ? published : true
      }
    });

    return res.status(201).json({ message: 'Rate Card created', rateCard });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRateCard = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, platformId, price, unit, published } = req.body;

    const rateCard = await prisma.rateCard.update({
      where: { id },
      data: {
        name,
        platformId: platformId || null,
        price: price !== undefined ? Number(price) : undefined,
        unit,
        published
      }
    });

    return res.json({ message: 'Rate Card updated', rateCard });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRateCard = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.rateCard.delete({ where: { id } });
    return res.json({ message: 'Rate Card deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
