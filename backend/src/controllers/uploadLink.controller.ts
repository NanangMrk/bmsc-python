import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/oembed?url=xxx  — server-side proxy untuk TikTok/YouTube/Instagram
export const oembedProxy = async (req: AuthRequest, res: Response) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'url query param required' });
  }

  try {
    let oembedUrl: string | null = null;

    if (url.includes('tiktok.com')) {
      oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (url.includes('instagram.com')) {
      oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&format=json`;
    }

    if (!oembedUrl) {
      return res.json({ title: null, thumbnail_url: null });
    }

    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BMSCBot/1.0)',
      },
    });

    if (!response.ok) {
      return res.json({ title: null, thumbnail_url: null });
    }

    const data = await response.json();
    return res.json({
      title: data.title || null,
      thumbnail_url: data.thumbnail_url || null,
      author_name: data.author_name || null,
    });
  } catch (error) {
    console.error('oEmbed proxy error:', error);
    return res.json({ title: null, thumbnail_url: null });
  }
};

// GET /api/projects/:projectId/uploads?platformId=xxx
export const getUploadLinks = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { platformId } = req.query;

    const where: any = { projectId };
    if (platformId) where.platformId = platformId as string;

    const links = await prisma.uploadLink.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json(links);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/projects/:projectId/uploads
export const createUploadLink = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { platformId, url, title, thumbnail } = req.body;

    if (!platformId || !url) {
      return res.status(400).json({ message: 'platformId and url are required' });
    }

    const link = await prisma.uploadLink.create({
      data: {
        projectId,
        platformId,
        url,
        title: title || null,
        thumbnail: thumbnail || null,
      }
    });

    return res.status(201).json(link);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/projects/:projectId/uploads/:linkId
export const deleteUploadLink = async (req: AuthRequest, res: Response) => {
  try {
    const { linkId } = req.params;

    await prisma.uploadLink.delete({ where: { id: linkId } });
    return res.json({ message: 'Link deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
