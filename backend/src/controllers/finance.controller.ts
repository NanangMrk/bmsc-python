import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

// --- QUOTATION ---
export const getQuotations = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    // If not super admin/admin, filter by access or brand
    let whereClause = {};
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      if (user.role === 'BRAND') {
        whereClause = { brandId: user.brandId };
      } else {
        whereClause = {
          userAccess: {
            some: { userId: user.id }
          }
        };
      }
    }

    const quotations = await prisma.quotation.findMany({
      where: whereClause,
      include: {
        brand: true,
        userAccess: {
          include: { user: { select: { id: true, name: true, email: true, companyName: true, address: true, phone: true, picName: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(quotations);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const getQuotationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        brand: true,
        invoice: true,
        userAccess: {
          include: { user: { select: { id: true, name: true, email: true, companyName: true, address: true, phone: true, picName: true } } }
        }
      }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    return res.json(quotation);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const createQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const { number, brandId, projectId, title, description, items, total, status, note, sentAt, userId } = req.body;

    let finalNumber = number;
    const existing = await prisma.quotation.findUnique({ where: { number: finalNumber } });
    if (existing) {
      finalNumber = `${finalNumber}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // Resolve brandId if userId is provided
    let finalBrandId = brandId || null;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.brandId) {
        finalBrandId = user.brandId;
      }
    }

    const quotation = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          number: finalNumber,
          brandId: finalBrandId,
          projectId: projectId || null,
          title: title || null,
          description: description || null,
          items,
          total: Number(total),
          status: status || 'DRAFT',
          createdAt: sentAt ? new Date(sentAt) : new Date()
        },
        include: {
          brand: true
        }
      });
      
        // Auto-assign user access if userId is provided
        if (userId) {
          await tx.quotationUserAccess.create({
            data: {
              quotationId: q.id,
              userId: userId
            }
          });
        }
        
        // Auto-generate invoice if status is DISETUJUI
        if (q.status === 'DISETUJUI') {
          const newInvoice = await tx.invoice.create({
            data: {
              number: `INV-${Date.now().toString().slice(-6)}`,
              quotationId: q.id,
              brandId: q.brandId,
              projectId: q.projectId,
              shareToken: crypto.randomBytes(16).toString('hex'),
              items: q.items as any,
              total: q.total,
              status: 'BELUM_DIBAYAR',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
          });
          
          if (userId) {
            await tx.invoiceUserAccess.create({
              data: { invoiceId: newInvoice.id, userId }
            });
          }
        }
        
        return q;
      });

      return res.status(201).json({ message: 'Quotation created', quotation });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const updateQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, items, total, status, note, userId } = req.body;
    
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const updatedQuotation = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.update({
        where: { id },
        data: {
          title: title !== undefined ? title : quotation.title,
          description: description !== undefined ? description : quotation.description,
          items: items || quotation.items,
          total: total !== undefined ? Number(total) : quotation.total,
          status: status || quotation.status,
        }
      });

      if (userId !== undefined) {
        await tx.quotationUserAccess.deleteMany({ where: { quotationId: q.id } });
        if (userId) {
          await tx.quotationUserAccess.create({
            data: { quotationId: q.id, userId }
          });
        }
      }
      if (q.status === 'DISETUJUI') {
        const existingInvoice = await tx.invoice.findUnique({ where: { quotationId: q.id } });
        if (!existingInvoice) {
          const newInvoice = await tx.invoice.create({
            data: {
              number: `INV-${Date.now().toString().slice(-6)}`,
              quotationId: q.id,
              brandId: q.brandId,
              projectId: q.projectId,
              shareToken: crypto.randomBytes(16).toString('hex'),
              items: q.items as any,
              total: q.total,
              status: 'BELUM_DIBAYAR',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
          });

          // Copy all user access from quotation to the new invoice
          const accessRecords = await tx.quotationUserAccess.findMany({ where: { quotationId: q.id } });
          if (accessRecords.length > 0) {
            await tx.invoiceUserAccess.createMany({
              data: accessRecords.map(record => ({
                invoiceId: newInvoice.id,
                userId: record.userId
              }))
            });
          }
        }
      }

      return q;
    });

    return res.json({ message: 'Quotation updated', quotation: updatedQuotation });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const deleteQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    await prisma.quotationUserAccess.deleteMany({ where: { quotationId: id } });
    
    // Delete any invoice linked to this quotation
    const invoice = await prisma.invoice.findFirst({ where: { quotationId: id } });
    if (invoice) {
      await prisma.invoiceUserAccess.deleteMany({ where: { invoiceId: invoice.id } });
      await prisma.invoice.delete({ where: { id: invoice.id } });
    }

    await prisma.quotation.delete({
      where: { id }
    });

    return res.json({ message: 'Quotation deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const generateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // quotationId
    const { invoiceNumber } = req.body;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { userAccess: true, invoice: true }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.invoice) {
      return res.status(400).json({ message: 'Invoice already exists for this quotation' });
    }

    // Generate Invoice Number if not provided
    const nextNumber = invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

    // Create Invoice and User Access within Transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const inv = await tx.invoice.create({
        data: {
          number: nextNumber,
          quotationId: quotation.id,
          brandId: quotation.brandId,
          projectId: quotation.projectId,
          items: quotation.items as any,
          total: quotation.total,
          status: 'BELUM_DIBAYAR', // Default status
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // +14 days
        }
      });

      // 2. Copy User Access
      if (quotation.userAccess.length > 0) {
        await tx.invoiceUserAccess.createMany({
          data: quotation.userAccess.map(ua => ({
            userId: ua.userId,
            invoiceId: inv.id
          }))
        });
      }

      // 3. Update Quotation Status
      await tx.quotation.update({
        where: { id: quotation.id },
        data: { status: 'DISETUJUI' }
      });

      return inv;
    });

    return res.status(201).json({ message: 'Invoice generated successfully', invoice });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// --- INVOICE ---
export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    let whereClause = {};
    console.log("Fetching invoices...");
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      if (user.role === 'BRAND') {
        whereClause = { brandId: user.brandId };
      } else {
        // Find invoices that belong to quotations the user has access to, or directly mapped
        whereClause = {
          OR: [
            {
              quotation: {
                userAccess: {
                  some: { userId: user.id }
                }
              }
            },
            // Fallback for direct invoice access if any
          ]
        };
      }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        quotation: true,
        userAccess: {
          include: { user: { select: { id: true, name: true, email: true, companyName: true, address: true, phone: true, picName: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(invoices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { number, quotationId, brandId, projectId, total, status } = req.body;

    const invoice = await prisma.invoice.create({
      data: {
        number,
        quotationId,
        brandId,
        projectId,
        shareToken: crypto.randomBytes(16).toString('hex'),
        items,
        total: Number(total),
        status: status || 'BELUM_DIBAYAR'
      }
    });

    return res.status(201).json({ message: 'Invoice created', invoice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateInvoiceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentProof } = req.body;

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (paymentProof !== undefined) dataToUpdate.paymentProof = paymentProof;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: dataToUpdate
    });

    return res.json({ message: 'Invoice status updated', invoice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice: any = await prisma.invoice.findUnique({
      where: { id },
      include: {
        quotation: true,
        userAccess: {
          include: { user: { select: { id: true, name: true, email: true, companyName: true, address: true, phone: true, picName: true } } }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.brandId) {
      invoice.brand = await prisma.brand.findUnique({ where: { id: invoice.brandId } });
    }
    if (invoice.projectId) {
      invoice.project = await prisma.project.findUnique({ where: { id: invoice.projectId } });
    }

    return res.json(invoice);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// --- FINANCE TRANSACTIONS ---
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    let whereClause = {};
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      if (user.role === 'BRAND') {
        whereClause = { brandId: user.brandId };
      }
    }

    const transactions = await prisma.financeTransaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
    return res.json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, type, amount, date, status, brandId } = req.body;

    const transaction = await prisma.financeTransaction.create({
      data: {
        name,
        category,
        type,
        amount: Number(amount),
        date: new Date(date),
        status: status || 'SUCCESS',
        brandId: brandId || null
      }
    });

    return res.status(201).json({ message: 'Transaction created', transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.financeTransaction.delete({
      where: { id }
    });
    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
