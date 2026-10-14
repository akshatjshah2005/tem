import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const createInvitationSchema = z.object({
  name: z.string().min(1).max(255),
  templateId: z.string().uuid().optional(),
  description: z.string().optional()
});

const updateInvitationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  templateId: z.string().uuid().optional(),
  description: z.string().optional(),
  content: z.record(z.any()).optional(),
  whatsappMessageTemplate: z.string().optional(),
  isPersonalized: z.boolean().optional(),
  personalizationEnabled: z.boolean().optional()
});

// Generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Get all invitations for current user
export const getInvitations = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { page = 1, limit = 20, status, search } = req.query;

  const where: any = { userId };
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [invitations, total] = await Promise.all([
    prisma.invitation.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true
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

// Get single invitation
export const getInvitation = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const invitation = await prisma.invitation.findFirst({
    where: { id, userId },
    include: {
      template: true,
      events: {
        orderBy: { displayOrder: 'asc' }
      },
      guests: {
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          status: true,
          personalToken: true,
          groupName: true
        }
      },
      media: {
        orderBy: { galleryOrder: 'asc' }
      },
      whatsappMessage: true,
      user: {
        select: { name: true }
      },
      _count: {
        select: { guests: true, events: true }
      }
    }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  res.json({
    success: true,
    data: invitation
  });
});

// Create invitation
export const createInvitation = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const validationResult = createInvitationSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(validationResult.error.issues[0].message, 400);
  }

  const { name, templateId, description } = validationResult.data;

  // Generate unique slug
  let slug = generateSlug(name);
  const existingInvitation = await prisma.invitation.findFirst({
    where: { userId, slug }
  });
  
  if (existingInvitation) {
    slug = `${slug}-${Date.now()}`;
  }

  const invitation = await prisma.invitation.create({
    data: {
      userId,
      name,
      slug,
      templateId,
      description
    }
  });

  res.status(201).json({
    success: true,
    data: invitation
  });
});

// Update invitation
export const updateInvitation = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const validationResult = updateInvitationSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(validationResult.error.issues[0].message, 400);
  }

  // Check if invitation exists and belongs to user
  const existingInvitation = await prisma.invitation.findFirst({
    where: { id, userId }
  });

  if (!existingInvitation) {
    throw new AppError('Invitation not found', 404);
  }

  const invitation = await prisma.invitation.update({
    where: { id },
    data: validationResult.data
  });

  res.json({
    success: true,
    data: invitation
  });
});

// Delete invitation
export const deleteInvitation = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const invitation = await prisma.invitation.findFirst({
    where: { id, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  await prisma.invitation.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Invitation deleted successfully'
  });
});

// Duplicate invitation
export const duplicateInvitation = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const invitation = await prisma.invitation.findFirst({
    where: { id, userId },
    include: {
      events: true
    }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  // Create new invitation
  const newSlug = `${invitation.slug}-copy-${Date.now()}`;
  
  const newInvitation = await prisma.invitation.create({
    data: {
      userId,
      name: `${invitation.name} (Copy)`,
      slug: newSlug,
      templateId: invitation.templateId,
      description: invitation.description,
      content: invitation.content as any,
      whatsappMessageTemplate: invitation.whatsappMessageTemplate
    }
  });

  // Copy events
  for (const event of invitation.events) {
    await prisma.event.create({
      data: {
        invitationId: newInvitation.id,
        name: event.name,
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        venueName: event.venueName,
        venueAddress: event.venueAddress,
        mapUrl: event.mapUrl,
        dressCode: event.dressCode,
        imageUrl: event.imageUrl,
        displayOrder: event.displayOrder
      }
    });
  }

  res.status(201).json({
    success: true,
    data: newInvitation
  });
});

// Publish invitation
export const publishInvitation = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const invitation = await prisma.invitation.findFirst({
    where: { id, userId },
    include: {
      events: true
    }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  if (!invitation.templateId) {
    throw new AppError('Template not selected', 400);
  }

  if (invitation.events.length === 0) {
    throw new AppError('At least one event is required', 400);
  }

  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });

  res.json({
    success: true,
    data: updated
  });
});

// Unpublish invitation
export const unpublishInvitation = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const invitation = await prisma.invitation.findFirst({
    where: { id, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      status: 'UNPUBLISHED'
    }
  });

  res.json({
    success: true,
    data: updated
  });
});

// Get public invitation by slug (no auth required)
export const getPublicInvitation = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const invitation = await prisma.invitation.findFirst({
    where: {
      slug,
      status: 'PUBLISHED'
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          slug: true,
          version: true,
          status: true,
          thumbnailUrl: true,
          previewUrl: true,
          isPremium: true,
          features: true,
          variables: true,
          editableFields: true,
          config: true
        }
      },
      events: {
        orderBy: { displayOrder: 'asc' }
      },
      media: {
        orderBy: { galleryOrder: 'asc' }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  res.json({
    success: true,
    data: invitation
  });
});

// Get personalized invitation by slug and token (no auth required)
export const getPersonalizedInvitation = asyncHandler(async (req: Request, res: Response) => {
  const { slug, token } = req.params;

  // First get the invitation
  const invitation = await prisma.invitation.findFirst({
    where: {
      slug,
      status: 'PUBLISHED'
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          slug: true,
          version: true,
          status: true,
          thumbnailUrl: true,
          previewUrl: true,
          isPremium: true,
          features: true,
          variables: true,
          editableFields: true,
          config: true
        }
      },
      events: {
        orderBy: { displayOrder: 'asc' }
      },
      media: {
        orderBy: { galleryOrder: 'asc' }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  // Find the guest by token
  const guest = await prisma.guest.findFirst({
    where: {
      invitationId: invitation.id,
      personalToken: token
    },
    include: {
      guestEvents: {
        include: {
          event: true
        }
      },
      rsvp: true
    }
  });

  if (!guest) {
    throw new AppError('Invalid or expired invitation link', 403);
  }

  res.json({
    success: true,
    data: {
      invitation,
      guest
    }
  });
});
