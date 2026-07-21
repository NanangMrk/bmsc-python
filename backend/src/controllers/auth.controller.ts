import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body; // 'email' field in request might be username or email

    if (!email || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is disabled' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name.toUpperCase().replace(/\s+/g, '_') },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Format permissions to a simple list for frontend
    const permissions = Array.isArray(user.role.permissions) ? user.role.permissions : [];

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name.toUpperCase().replace(/\s+/g, '_'),
        brandId: user.brandId,
        permissions
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const permissions = Array.isArray(user.role.permissions) ? user.role.permissions : [];

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name.toUpperCase().replace(/\s+/g, '_'),
        brandId: user.brandId,
        permissions
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
