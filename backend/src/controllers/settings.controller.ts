import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: 'GLOBAL' }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: 'GLOBAL',
          agencyName: '',
          corporateName: '',
          tagline: '',
          email: '',
          phone: '',
          building: '',
          address: '',
          quoAccentColor: '#ea580c',
          quoShowSignature: true,
          quoSignatoryName: 'Nanang M.',
          quoSignatoryRole: 'Chief Executive',
          quoTermsText: '1. Penawaran harga ini berlaku selama 30 hari sejak tanggal diterbitkan.\n2. Pekerjaan baru akan dimulai setelah disetujui secara tertulis atau dikeluarkannya Invoice uang muka (DP).',
          quoTaxEnabled: true,
          quoTaxName: 'PPN',
          quoTaxPercent: 11,
          quoShowBank: false,
          invAccentColor: '#ea580c',
          invShowSignature: true,
          invSignatoryName: 'Finance Dept',
          invSignatoryRole: 'Finance & Accounting',
          invTermsText: '1. Pembayaran harap dilakukan selambatnya 14 hari setelah invoice diterbitkan.\n2. Mohon sertakan Nomor Invoice pada berita transfer.\n3. Kirimkan bukti transfer ke finance@nanangmrk.com.',
          invTaxEnabled: true,
          invTaxName: 'PPN',
          invTaxPercent: 11,
          invShowBank: true
        }
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings', error });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.systemSetting.upsert({
      where: { id: 'GLOBAL' },
      update: req.body,
      create: {
        id: 'GLOBAL',
        ...req.body
      }
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error });
  }
};
