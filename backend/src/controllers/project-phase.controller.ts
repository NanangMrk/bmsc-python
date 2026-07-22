import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// --- PAYMENT PHASE ---
export const updatePaymentTermin = async (req: AuthRequest, res: Response) => {
  try {
    const terminId = req.params.terminId as string;
    const { status, proofFile, type, amount, billToId } = req.body; // In a real app, proofFile would be handled by multer

    const updateData: any = {};
    if (status) updateData.status = status;
    if (proofFile) updateData.proofFile = proofFile;
    if (type) updateData.type = type;
    if (amount !== undefined) updateData.amount = amount;
    if (billToId !== undefined) updateData.billToId = billToId;

    // If status is 'LUNAS', we set verifiedBy
    if (status === 'LUNAS') {
      updateData.verifiedBy = req.user?.id;
      updateData.verifiedAt = new Date();
    }

    const payment = await prisma.paymentTermin.update({
      where: { id: terminId },
      data: updateData
    });

    return res.json({ message: 'Payment updated', payment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPaymentTermin = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const { type, amount, description } = req.body;

    const payment = await prisma.paymentTermin.create({
      data: {
        projectId,
        type,
        amount: amount || 0,
        percentage: 0,
        status: 'MENUNGGU'
      }
    });

    return res.status(201).json({ message: 'Payment created', payment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePaymentTermin = async (req: AuthRequest, res: Response) => {
  try {
    const terminId = req.params.terminId as string;
    
    await prisma.paymentTermin.delete({
      where: { id: terminId }
    });

    return res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPaymentTerminById = async (req: Request, res: Response) => {
  try {
    const terminId = req.params.terminId as string;
    
    const payment = await prisma.paymentTermin.findUnique({
      where: { id: terminId },
      include: {
        project: {
          include: {
            brand: true
          }
        },
        billTo: {
          include: {
            brand: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.json(payment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// --- CONCEPT PHASE ---
export const saveConceptPage = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const { platformId, content } = req.body;

    if (!platformId || !content) {
      return res.status(400).json({ message: 'Platform ID and content are required' });
    }

    // Upsert concept page based on project and platform
    // Since prisma schema doesn't have a unique constraint on [projectId, platformId], 
    // we use findFirst then create/update, or we can just create multiple. Let's assume one concept per platform per project.
    
    let concept = await prisma.conceptPage.findFirst({
      where: { projectId, platformId }
    });

    if (concept) {
      concept = await prisma.conceptPage.update({
        where: { id: concept.id },
        data: { content }
      });
    } else {
      concept = await prisma.conceptPage.create({
        data: {
          projectId,
          platformId,
          content
        }
      });
    }

    return res.json({ message: 'Concept saved', concept });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// --- SCRIPT PHASE ---
export const createScriptSegment = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const { platformId, title, subtitle } = req.body;

    const segment = await prisma.scriptSegment.create({
      data: {
        projectId,
        platformId,
        title,
        subtitle
      }
    });

    return res.status(201).json({ message: 'Segment created', segment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addScriptRow = async (req: AuthRequest, res: Response) => {
  try {
    const segmentId = req.params.segmentId as string;
    const { rowNumber, audioText, visualText, duration, wordCount } = req.body;

    const row = await prisma.scriptRow.create({
      data: {
        segmentId,
        rowNumber,
        audioText,
        visualText,
        duration: duration ? Number(duration) : null,
        wordCount: wordCount ? Number(wordCount) : null
      }
    });

    return res.status(201).json({ message: 'Row added', row });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
