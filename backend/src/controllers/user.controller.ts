import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        role: true,
        brandId: true,
        brand: true,
        projectAccess: { select: { projectId: true } },
        quotationAccess: { select: { quotationId: true } },
        invoiceAccess: { select: { invoiceId: true } }
      }
    });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, username, picName, phone, email, password, address, roleId, brandId } = req.body;

    if (!companyName || !username || !password || !roleId) {
      return res.status(400).json({ message: 'Missing required fields: companyName, username, password, roleId' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already in use' });
      }
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = picName || companyName;

    const newUser = await prisma.user.create({
      data: {
        name,
        companyName,
        username,
        picName: picName || null,
        phone: phone || null,
        address: address || null,
        email: email || null,
        password: hashedPassword,
        roleId,
        brandId: brandId || null
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        username: true,
        email: true,
        isActive: true,
        role: true,
      }
    });

    return res.status(201).json({ message: 'User created', user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserAccess = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { projectIds, quotationIds, invoiceIds } = req.body;

    // We do this in a transaction: delete old access, create new ones.
    await prisma.$transaction([
      prisma.projectUserAccess.deleteMany({ where: { userId: id } }),
      prisma.quotationUserAccess.deleteMany({ where: { userId: id } }),
      prisma.invoiceUserAccess.deleteMany({ where: { userId: id } }),
      
      ...(projectIds?.length ? [
        prisma.projectUserAccess.createMany({
          data: projectIds.map((projectId: string) => ({
            userId: id,
            projectId
          }))
        })
      ] : []),

      ...(quotationIds?.length ? [
        prisma.quotationUserAccess.createMany({
          data: quotationIds.map((quotationId: string) => ({
            userId: id,
            quotationId
          }))
        })
      ] : []),

      ...(invoiceIds?.length ? [
        prisma.invoiceUserAccess.createMany({
          data: invoiceIds.map((invoiceId: string) => ({
            userId: id,
            invoiceId
          }))
        })
      ] : [])
    ]);

    // Automatically sync access to any invoices that belong to the mapped quotations
    if (quotationIds?.length) {
      const associatedInvoices = await prisma.invoice.findMany({
        where: { quotationId: { in: quotationIds } },
        select: { id: true }
      });
      if (associatedInvoices.length > 0) {
        // Only create if they don't already have access (using createMany with skipDuplicates if possible, or just ignore errors via raw or simple createMany since we deleted all first)
        // Wait, we deleted all invoiceUserAccess for this user above! So we can just create safely.
        // Except we might have already added them in `invoiceIds` array. 
        // We filter out the ones already in `invoiceIds`.
        const newInvoiceIds = associatedInvoices
          .map(inv => inv.id)
          .filter(invId => !invoiceIds?.includes(invId));
          
        if (newInvoiceIds.length > 0) {
          await prisma.invoiceUserAccess.createMany({
            data: newInvoiceIds.map(invoiceId => ({ userId: id, invoiceId }))
          });
        }
      }
    }

    // If user has a brandId, assign it to any quotations that don't have a brand yet
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.brandId && quotationIds?.length) {
      await prisma.quotation.updateMany({
        where: { id: { in: quotationIds }, brandId: null },
        data: { brandId: user.brandId }
      });
    }

    // If user has a brandId, also assign it to any projects that don't have a brand yet
    if (user?.brandId && projectIds?.length) {
      await prisma.project.updateMany({
        where: { id: { in: projectIds }, brandId: null },
        data: { brandId: user.brandId }
      });
    }

    return res.json({ message: 'User access updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, roleId, password } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (address !== undefined) dataToUpdate.address = address;
    if (roleId) dataToUpdate.roleId = roleId;

    if (password) {
      const bcrypt = await import('bcryptjs');
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true }
    });

    return res.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Delete all related access records first
    await prisma.$transaction([
      prisma.projectUserAccess.deleteMany({ where: { userId: id } }),
      prisma.quotationUserAccess.deleteMany({ where: { userId: id } }),
      prisma.invoiceUserAccess.deleteMany({ where: { userId: id } }),
    ]);

    await prisma.user.delete({ where: { id } });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
