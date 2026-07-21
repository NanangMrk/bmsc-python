import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getPlatforms = async (req: Request, res: Response) => {
  try {
    const platforms = await prisma.platform.findMany();
    return res.json(platforms);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPlatform = async (req: Request, res: Response) => {
  try {
    const { name, icon, idealCost } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Platform name is required' });
    }

    const platform = await prisma.platform.create({
      data: {
        name,
        icon,
        idealCost: idealCost ? Number(idealCost) : null
      }
    });

    return res.status(201).json({ message: 'Platform created', platform });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePlatform = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, icon, idealCost } = req.body;

    const platform = await prisma.platform.update({
      where: { id },
      data: {
        name,
        icon,
        idealCost: idealCost ? Number(idealCost) : null
      }
    });

    return res.json({ message: 'Platform updated', platform });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePlatform = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.platform.delete({ where: { id } });
    return res.json({ message: 'Platform deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
