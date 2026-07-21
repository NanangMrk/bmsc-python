import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/projects/:projectId/tasks?platformId=xxx
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { platformId } = req.query;

    const where: any = { projectId };
    if (platformId) where.platformId = platformId as string;

    const tasks = await prisma.productionTask.findMany({
      where,
      orderBy: { deadline: 'asc' }
    });

    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/projects/:projectId/tasks
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { platformId, title, assigneeId, status, deadline } = req.body;

    if (!platformId || !title) {
      return res.status(400).json({ message: 'platformId and title are required' });
    }

    const task = await prisma.productionTask.create({
      data: {
        projectId,
        platformId,
        title,
        assigneeId: assigneeId || null,
        status: status || 'TODO',
        deadline: deadline ? new Date(deadline) : null,
      }
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/projects/:projectId/tasks/:taskId
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, assigneeId, status, deadline } = req.body;

    const task = await prisma.productionTask.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(status !== undefined && { status }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      }
    });

    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/projects/:projectId/tasks/:taskId
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    await prisma.productionTask.delete({ where: { id: taskId } });
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
