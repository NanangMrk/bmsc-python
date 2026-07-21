import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/projects/:id/scripts?platformId=xxx
export const getScripts = async (req: AuthRequest, res: Response) => {
  try {
    const { id: projectId } = req.params;
    const { platformId } = req.query;

    const where: any = { projectId };
    if (platformId) where.platformId = platformId as string;

    const segments = await prisma.scriptSegment.findMany({
      where,
      include: {
        rows: {
          orderBy: { rowNumber: 'asc' },
          include: {
            comments: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { title: 'asc' }
    });

    return res.json(segments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/projects/:id/scripts/save  (upsert entire script for a platform)
export const saveScripts = async (req: AuthRequest, res: Response) => {
  try {
    const { id: projectId } = req.params;
    const { platformId, segments } = req.body;

    if (!platformId || !Array.isArray(segments)) {
      return res.status(400).json({ message: 'platformId and segments are required' });
    }

    // Delete existing segments for this project+platform
    const existing = await prisma.scriptSegment.findMany({ where: { projectId, platformId }, select: { id: true } });
    const existingIds = existing.map(s => s.id);
    if (existingIds.length > 0) {
      // Get all row ids to delete comments first (cascade should handle it, but be explicit)
      const existingRows = await prisma.scriptRow.findMany({ where: { segmentId: { in: existingIds } }, select: { id: true } });
      const existingRowIds = existingRows.map(r => r.id);
      if (existingRowIds.length > 0) {
        await prisma.rowComment.deleteMany({ where: { rowId: { in: existingRowIds } } });
      }
      await prisma.scriptRow.deleteMany({ where: { segmentId: { in: existingIds } } });
      await prisma.scriptSegment.deleteMany({ where: { id: { in: existingIds } } });
    }

    // Create new segments with rows
    const created = await Promise.all(
      segments.map(async (seg: any) => {
        return prisma.scriptSegment.create({
          data: {
            projectId,
            platformId,
            title: seg.name || seg.title || 'Segment',
            subtitle: seg.desc || seg.subtitle || null,
            rows: {
              create: (seg.rows || []).map((row: any) => ({
                rowNumber: row.row || row.rowNumber || '1.1',
                audioText: row.audio || row.audioText || null,
                visualText: row.visual || row.visualText || null,
                imageUrl: row.image || row.imageUrl || null,
                duration: typeof row.duration === 'number' ? row.duration : parseInt(row.duration) || 0,
                wordCount: row.wordCount || null,
              }))
            }
          },
          include: {
            rows: {
              include: { comments: true }
            }
          }
        });
      })
    );

    return res.json({ message: 'Script saved', segments: created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/scripts/rows/:rowId/comments
export const addRowComment = async (req: AuthRequest, res: Response) => {
  try {
    const { rowId } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.name || 'Unknown';

    if (!text?.trim()) {
      return res.status(400).json({ message: 'text is required' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify row exists
    const row = await prisma.scriptRow.findUnique({ where: { id: rowId } });
    if (!row) {
      return res.status(404).json({ message: 'Row not found' });
    }

    const comment = await prisma.rowComment.create({
      data: {
        rowId,
        userId,
        userName,
        text: text.trim(),
      }
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/scripts/rows/:rowId/comments/:commentId
export const deleteRowComment = async (req: AuthRequest, res: Response) => {
  try {
    const { rowId, commentId } = req.params;
    const userId = req.user?.id;

    const comment = await prisma.rowComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.rowId !== rowId) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.rowComment.delete({ where: { id: commentId } });
    return res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
