import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createShipment = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    
    const shipment = await prisma.shipment.create({
      data: {
        ...data
      }
    });
    return res.json(shipment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateShipment = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    
    const shipment = await prisma.shipment.update({
      where: { id },
      data
    });
    return res.json(shipment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteShipment = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.shipment.delete({ where: { id } });
    return res.json({ message: 'Shipment deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
