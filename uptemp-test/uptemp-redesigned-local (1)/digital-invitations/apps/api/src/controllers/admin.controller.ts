import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Get dashboard stats
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalUsers,
    totalInvitations,
    publishedInvitations,
    totalGuests,
    personalizedLinks,
    bulkRequests,
    activeTemplates,
    draftTemplates,
    premiumTemplates
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.invitation.count(),
    prisma.invitation.count({ where: { status: 'PUBLISHED' } }),
    prisma.guest.count(),
    prisma.guest.count({ where: { personalizedLink: { not: null } } }),
    prisma.bulkRequest.count({ where: { status: 'PENDING' } }),
    prisma.template.count({ where: { status: 'PUBLISHED' } }),
    prisma.template.count({ where: { status: 'DRAFT' } }),
    prisma.template.count({ where: { isPremium: true } })
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalInvitations,
      publishedInvitations,
      totalGuests,
      personalizedLinks,
      bulkRequests,
      activeTemplates,
      draftTemplates,
      premiumTemplates
    }
  });
});

// Get all users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search } = req.query;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { mobile: { contains: search as string } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            invitations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Get user details
export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          invitations: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

// Update user status
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true
    }
  });

  res.json({
    success: true,
    data: updatedUser
  });
});

// Get all invitations (admin)
export const getAllInvitations = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { slug: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const [invitations, total] = await Promise.all([
    prisma.invitation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            guests: true,
            events: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.invitation.count({ where })
  ]);

  res.json({
    success: true,
    data: invitations,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Get bulk requests
export const getBulkRequests = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status } = req.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  const [requests, total] = await Promise.all([
    prisma.bulkRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        invitation: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.bulkRequest.count({ where })
  ]);

  res.json({
    success: true,
    data: requests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Update bulk request status
export const updateBulkRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const request = await prisma.bulkRequest.findUnique({
    where: { id }
  });

  if (!request) {
    throw new AppError('Bulk request not found', 404);
  }

  const updatedRequest = await prisma.bulkRequest.update({
    where: { id },
    data: {
      status,
      adminNotes
    }
  });

  res.json({
    success: true,
    data: updatedRequest
  });
});
