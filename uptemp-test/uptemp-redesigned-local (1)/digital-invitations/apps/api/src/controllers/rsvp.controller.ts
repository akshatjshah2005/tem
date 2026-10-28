import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const rsvpSchema = z.object({
  response: z.enum(['ACCEPT', 'DECLINE']),
  guestsCount: z.number().min(1).max(20).optional().default(1),
  dietary: z.string().max(200).optional(),
  message: z.string().max(500).optional(),
  eventIds: z.array(z.string().uuid()).optional()
});

// Submit RSVP (public - no auth)
export const submitRsvp = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const body = rsvpSchema.parse(req.body);

  // Find guest by personal token
  const guest = await prisma.guest.findUnique({
    where: { personalToken: token },
    include: {
      invitation: {
        include: { events: true }
      }
    }
  });

  if (!guest) {
    throw new AppError('Invalid invitation link', 404);
  }

  if (!guest.invitation || guest.invitation.status !== 'PUBLISHED') {
    throw new AppError('This invitation is no longer available', 404);
  }

  // Check if RSVP already exists
  const existingRsvp = await prisma.rsvp.findUnique({
    where: { guestId: guest.id }
  });

  let rsvp;
  if (existingRsvp) {
    // Update existing RSVP
    rsvp = await prisma.rsvp.update({
      where: { guestId: guest.id },
      data: {
        response: body.response,
        guestsCount: body.guestsCount,
        dietary: body.dietary,
        message: body.message,
        respondedAt: new Date()
      }
    });
  } else {
    // Create new RSVP
    rsvp = await prisma.rsvp.create({
      data: {
        guestId: guest.id,
        invitationId: guest.invitationId,
        response: body.response,
        guestsCount: body.guestsCount,
        dietary: body.dietary,
        message: body.message,
        respondedAt: new Date()
      }
    });
  }

  // Update guest status
  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      status: body.response === 'ACCEPT' ? 'ATTENDING' : 'NOT_ATTENDING'
    }
  });

  // If event IDs provided, update guest-event assignments
  if (body.eventIds && body.eventIds.length > 0) {
    // Remove existing assignments
    await prisma.guestEvent.deleteMany({
      where: { guestId: guest.id }
    });

    // Create new assignments
    for (const eventId of body.eventIds) {
      await prisma.guestEvent.create({
        data: {
          guestId: guest.id,
          eventId
        }
      });
    }
  }

  res.json({
    success: true,
    message: 'RSVP submitted successfully',
    data: { rsvp }
  });
});

// Get RSVP stats for invitation (auth required)
export const getRsvpStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  const totalGuests = await prisma.guest.count({
    where: { invitationId }
  });

  const rsvps = await prisma.rsvp.groupBy({
    by: ['response'],
    where: { invitationId },
    _count: true,
    _sum: {
      guestsCount: true
    }
  });

  const stats = {
    totalGuests,
    responded: 0,
    attending: 0,
    notAttending: 0,
    pending: totalGuests,
    totalAttending: 0
  };

  for (const r of rsvps) {
    stats.responded += r._count;
    if (r.response === 'ACCEPT') {
      stats.attending = r._count;
      stats.totalAttending = r._sum.guestsCount || 0;
    } else if (r.response === 'DECLINE') {
      stats.notAttending = r._count;
    }
    stats.pending = totalGuests - stats.responded;
  }

  // Get detailed RSVP list
  const rsvpList = await prisma.rsvp.findMany({
    where: { invitationId },
    include: {
      guest: {
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          groupName: true
        }
      }
    },
    orderBy: { respondedAt: 'desc' }
  });

  res.json({
    success: true,
    data: { stats, rsvps: rsvpList }
  });
});
