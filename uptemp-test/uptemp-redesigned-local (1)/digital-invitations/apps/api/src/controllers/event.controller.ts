import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

// Accept "HH:MM", "HH:MM:SS", or full ISO datetime; store time as UTC on 1970-01-01
// so PostgreSQL TIME columns round-trip consistently with getUTCHours()/getUTCMinutes().
const parseTimeInput = (str: string): Date => {
  if (/^\d{2}:\d{2}$/.test(str)) {
    return new Date(`1970-01-01T${str}:00.000Z`);
  }
  if (/^\d{2}:\d{2}:\d{2}$/.test(str)) {
    return new Date(`1970-01-01T${str}.000Z`);
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid time value');
  }
  return d;
};

// Validation schemas
const createEventSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  date: z.string().transform(str => {
    const d = new Date(str);
    if (isNaN(d.getTime())) throw new Error('Invalid date');
    return d;
  }),
  startTime: z.string().optional().transform(str => str ? parseTimeInput(str) : undefined),
  endTime: z.string().optional().transform(str => str ? parseTimeInput(str) : undefined),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  mapUrl: z.string().url().optional(),
  dressCode: z.string().optional(),
  imageUrl: z.string().url().optional(),
  displayOrder: z.number().optional()
});

const updateEventSchema = createEventSchema.partial();

// Get events for invitation
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  const events = await prisma.event.findMany({
    where: { invitationId },
    orderBy: { displayOrder: 'asc' }
  });

  res.json({
    success: true,
    data: events
  });
});

// Get single event
export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      }
    }
  });

  if (!event || event.invitation.userId !== userId) {
    throw new AppError('Event not found', 404);
  }

  res.json({
    success: true,
    data: event
  });
});

// Create event
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  const validationResult = createEventSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(validationResult.error.issues[0].message, 400);
  }

  const { displayOrder, ...eventData } = validationResult.data;

  // Get next display order if not provided
  let order = displayOrder;
  if (order === undefined) {
    const lastEvent = await prisma.event.findFirst({
      where: { invitationId },
      orderBy: { displayOrder: 'desc' }
    });
    order = (lastEvent?.displayOrder || 0) + 1;
  }

  const event = await prisma.event.create({
    data: {
      invitationId,
      ...eventData,
      displayOrder: order
    }
  });

  res.status(201).json({
    success: true,
    data: event
  });
});

// Update event
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      }
    }
  });

  if (!event || event.invitation.userId !== userId) {
    throw new AppError('Event not found', 404);
  }

  const validationResult = updateEventSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(validationResult.error.issues[0].message, 400);
  }

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: validationResult.data
  });

  res.json({
    success: true,
    data: updatedEvent
  });
});

// Delete event
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      }
    }
  });

  if (!event || event.invitation.userId !== userId) {
    throw new AppError('Event not found', 404);
  }

  // Remove guest-event assignments
  await prisma.guestEvent.deleteMany({
    where: { eventId }
  });

  // Delete event
  await prisma.event.delete({
    where: { id: eventId }
  });

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

// Reorder events
export const reorderEvents = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;
  const { eventIds } = req.body;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  // Update display order for each event
  for (let i = 0; i < eventIds.length; i++) {
    await prisma.event.update({
      where: { id: eventIds[i] },
      data: { displayOrder: i + 1 }
    });
  }

  res.json({
    success: true,
    message: 'Events reordered successfully'
  });
});
