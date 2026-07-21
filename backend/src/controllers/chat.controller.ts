import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const messages = await prisma.chatMessage.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { message, attachment } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        projectId,
        userId,
        message,
        attachment
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
