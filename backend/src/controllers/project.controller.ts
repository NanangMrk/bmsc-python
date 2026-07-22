import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    let whereClause: any = {};
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      whereClause = {};
    } else if (user?.role === 'BRAND' && user.brandId) {
      whereClause = {
        OR: [
          { brandId: user.brandId },
          { userAccess: { some: { userId: user.id } } }
        ]
      };
    } else if (user) {
      whereClause = { userAccess: { some: { userId: user.id } } };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        brand: true,
        platforms: {
          include: { platform: true }
        },
        payments: { include: { billTo: { include: { brand: true } } } },
        userAccess: {
          include: { user: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    let whereClause: any = { id };
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      // no extra filter
    } else if (user?.role === 'BRAND' && user.brandId) {
      whereClause.OR = [
        { brandId: user.brandId },
        { userAccess: { some: { userId: user.id } } }
      ];
    } else if (user) {
      whereClause.userAccess = { some: { userId: user.id } };
    }

    const project = await prisma.project.findFirst({
      where: whereClause,
      include: {
        brand: true,
        platforms: { include: { platform: true } },
        payments: { include: { billTo: { include: { brand: true } } } },
        shipments: true,
        conceptPages: true,
        scripts: { include: { rows: { include: { comments: { orderBy: { createdAt: 'asc' } } } } } },
        productionTasks: true,
        uploads: true,
        chatMessages: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    console.log("createProject req.body:", req.body);
    const { name, brandId, startDate, deadline, totalValue, platformIds, picIds } = req.body;

    if (!name || !startDate || totalValue === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const dpAmount = Number(totalValue) * 0.5;
    const pelunasanAmount = Number(totalValue) * 0.5;

    // Use a transaction to ensure all related records are created together
    const newProject = await prisma.$transaction(async (tx) => {
      // 1. Create Project
      const project = await tx.project.create({
        data: {
          name,
          brandId: brandId || null,
          startDate: new Date(startDate),
          deadline: deadline ? new Date(deadline) : null,
          totalValue: Number(totalValue),
          status: 'ACTIVE',
        }
      });

      // 2. Attach Platforms
      if (platformIds && Array.isArray(platformIds)) {
        for (const platformId of platformIds) {
          await tx.projectPlatform.create({
            data: {
              projectId: project.id,
              platformId
            }
          });
        }
      }

      // 2.5 Assign PICs (Users) - Automatically include creator
      const finalPicIds = new Set<string>(Array.isArray(picIds) ? picIds : []);
      if (req.user?.id) {
        finalPicIds.add(req.user.id);
      }

      if (finalPicIds.size > 0) {
        for (const userId of finalPicIds) {
          await tx.projectUserAccess.create({
            data: {
              projectId: project.id,
              userId
            }
          });
          
          await tx.appNotification.create({
            data: {
              userId,
              icon: '📁',
              title: 'Project Baru',
              desc: `Project "${project.name}" telah dibuat dan Anda ditugaskan ke dalamnya.`
            }
          });
        }
      }

      // 3. Auto-generate Payment Termins (DP 50%, Pelunasan 50%)
      await tx.paymentTermin.createMany({
        data: [
          {
            projectId: project.id,
            type: 'DP',
            percentage: 50,
            amount: dpAmount,
            status: 'MENUNGGU'
          },
          {
            projectId: project.id,
            type: 'PELUNASAN',
            percentage: 50,
            amount: pelunasanAmount,
            status: 'MENUNGGU'
          }
        ]
      });

      return project;
    });

    return res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, brandId, startDate, deadline, totalValue, status, platformIds, picIds } = req.body;

    if (!name || !startDate || totalValue === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
      // 1. Update core project fields
      const project = await tx.project.update({
        where: { id },
        data: {
          name,
          brandId: brandId || null,
          startDate: new Date(startDate),
          deadline: deadline ? new Date(deadline) : null,
          totalValue: Number(totalValue),
          status: status || 'ACTIVE',
        }
      });

      // 2. Update Platforms (delete old, insert new)
      if (platformIds && Array.isArray(platformIds)) {
        await tx.projectPlatform.deleteMany({ where: { projectId: id } });
        for (const platformId of platformIds) {
          await tx.projectPlatform.create({
            data: { projectId: id, platformId }
          });
        }
      }

      // 3. Update PICs (delete old, insert new)
      if (picIds && Array.isArray(picIds)) {
        await tx.projectUserAccess.deleteMany({ where: { projectId: id } });
        for (const userId of picIds) {
          await tx.projectUserAccess.create({
            data: { projectId: id, userId }
          });
        }
      }

      // 4. Update Payment Termins if totalValue changed?
      // Since it's complex to handle partial payments, we'll assume totalValue updates 
      // might just require manual invoice updates for now, or just update the DP/Pelunasan.
      // For simplicity, we skip payment recalculation here unless requested.

      return project;
    });

    return res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProjectProgress = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { progress, phaseStatuses } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: { progress, phaseStatuses }
    });

    return res.json({ message: 'Project progress updated', project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: { status }
    });

    return res.json({ message: 'Project status updated', project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const projectId = id as string;
    
    // We must delete dependent records first due to foreign keys.
    const segments = await prisma.scriptSegment.findMany({ where: { projectId }, select: { id: true } });
    const segmentIds = segments.map(s => s.id);
    const rows = await prisma.scriptRow.findMany({ where: { segmentId: { in: segmentIds } }, select: { id: true } });
    const rowIds = rows.map(r => r.id);

    await prisma.$transaction([
      prisma.rowComment.deleteMany({ where: { rowId: { in: rowIds } } }),
      prisma.scriptRow.deleteMany({ where: { segmentId: { in: segmentIds } } }),
      prisma.scriptSegment.deleteMany({ where: { projectId } }),
      prisma.productionTask.deleteMany({ where: { projectId } }),
      prisma.uploadLink.deleteMany({ where: { projectId } }),
      prisma.chatMessage.deleteMany({ where: { projectId } }),
      prisma.projectUserAccess.deleteMany({ where: { projectId } }),
      prisma.paymentTermin.deleteMany({ where: { projectId } }),
      prisma.projectPlatform.deleteMany({ where: { projectId } }),
      prisma.shipment.deleteMany({ where: { projectId } }),
      prisma.conceptPage.deleteMany({ where: { projectId } }),
      // Unlink from quotations & invoices (if any)
      prisma.quotation.updateMany({ where: { projectId }, data: { projectId: null } }),
      prisma.invoice.updateMany({ where: { projectId }, data: { projectId: null } }),
      // Finally delete project
      prisma.project.delete({ where: { id: projectId } })
    ]);

    return res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
