import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    return res.json(roles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const { name, permissions } = req.body; 

    if (!name) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        permissions: permissions || []
      }
    });

    return res.status(201).json({ message: 'Role created', role: newRole });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, permissions } = req.body;

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: permissions || []
      }
    });

    return res.json({ message: 'Role updated', role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // Check if role is used by users
    const usersWithRole = await prisma.user.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      return res.status(400).json({ message: 'Cannot delete role assigned to users' });
    }

    await prisma.role.delete({ where: { id } });
    return res.json({ message: 'Role deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
