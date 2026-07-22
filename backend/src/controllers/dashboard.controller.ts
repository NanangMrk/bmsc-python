import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Filter limit strictly to projects where user has access, UNLESS they are admin
    const isAdmin = userRole === 'SYS_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'OWNER';
    
    const userAccessFilter = isAdmin ? {} : {
      userAccess: {
        some: {
          userId
        }
      }
    };

    let invoiceFilter: any = {};
    if (!isAdmin) {
      const userProjects = await prisma.project.findMany({
        where: userAccessFilter,
        select: { id: true }
      });
      invoiceFilter = {
        OR: [
          { projectId: { in: userProjects.map(p => p.id) } },
          { userAccess: { some: { userId } } }
        ]
      };
    }

    // 1. Total Revenue (Invoices LUNAS)
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        status: 'LUNAS',
        ...invoiceFilter
      },
      select: { total: true }
    });
    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + Number(inv.total), 0);

    // 2. Active Projects
    const activeProjects = await prisma.project.count({
      where: {
        status: 'ACTIVE',
        ...userAccessFilter
      }
    });

    // 3. Late Projects (deadline < now and not COMPLETED)
    const lateProjects = await prisma.project.count({
      where: {
        deadline: { lt: new Date() },
        status: { not: 'COMPLETED' },
        ...userAccessFilter
      }
    });

    // 4. Pending Payments (Invoices MENUNGGU_VERIFIKASI)
    const pendingPayments = await prisma.invoice.count({
      where: {
        status: 'MENUNGGU_VERIFIKASI',
        ...invoiceFilter
      }
    });

    // 5. Recent Projects (top 5)
    const recentProjects = await prisma.project.findMany({
      where: userAccessFilter,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        brand: { select: { name: true } },
        platforms: { include: { platform: true } },
        userAccess: { include: { user: { select: { id: true, name: true, role: { select: { name: true } } } } } }
      }
    });

    // 6. Recent Invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: invoiceFilter,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        quotation: { select: { title: true } },
      }
    });

    // 7. Monthly Revenue (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentPaidInvoices = await prisma.invoice.findMany({
      where: {
        status: 'LUNAS',
        ...invoiceFilter,
        createdAt: { gte: sixMonthsAgo }
      },
      select: { total: true, createdAt: true }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyRevenue.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        revenue: 0,
        target: 50000000 // Standard arbitrary target
      });
    }

    recentPaidInvoices.forEach(inv => {
      const m = monthNames[inv.createdAt.getMonth()];
      const y = inv.createdAt.getFullYear();
      const slot = monthlyRevenue.find(x => x.month === m && x.year === y);
      if (slot) {
        slot.revenue += Number(inv.total);
      }
    });

    // 8. Platform Stats
    const projectsWithPlatforms = await prisma.project.findMany({
      where: userAccessFilter,
      include: {
        platforms: { include: { platform: true } }
      }
    });

    const platformCount: Record<string, number> = {};
    projectsWithPlatforms.forEach(p => {
      p.platforms.forEach(pp => {
        const name = pp.platform.name;
        platformCount[name] = (platformCount[name] || 0) + 1;
      });
    });

    const colors = ['#f97316', '#3b82f6', '#ec4899', '#10b981', '#8b5cf6'];
    const platformStats = Object.entries(platformCount).map(([platform, count], i) => ({
      platform,
      projects: count,
      fill: colors[i % colors.length]
    }));

    // Construct response
    return res.json({
      totalRevenue,
      activeProjects,
      lateProjects,
      pendingPayments,
      recentProjects,
      recentInvoices,
      monthlyRevenue,
      platformStats
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
