import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { randomBytes } from 'crypto';

// Generate secure token
const generateToken = (): string => {
  return randomBytes(8).toString('base64url').substring(0, 10);
};

// Validation schemas
const createGuestSchema = z.object({
  name: z.string().min(2).max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  email: z.string().email().optional(),
  groupName: z.string().optional(),
  eventIds: z.array(z.string().uuid()).optional()
});

const updateGuestSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/).optional(),
  email: z.string().email().optional(),
  groupName: z.string().optional(),
  eventIds: z.array(z.string().uuid()).optional()
});

// Get guests for invitation
export const getGuests = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;
  const { page = 1, limit = 20, search, status, group } = req.query;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  const where: any = { invitationId };
  
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { mobile: { contains: search as string } },
      { email: { contains: search as string, mode: 'insensitive' } }
    ];
  }
  
  if (status) {
    where.status = status;
  }
  
  if (group) {
    where.groupName = group;
  }

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      include: {
        guestEvents: {
          include: {
            event: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        rsvp: {
          select: {
            response: true,
            respondedAt: true,
            guestsCount: true,
            message: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.guest.count({ where })
  ]);

  res.json({
    success: true,
    data: guests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Get single guest
export const getGuest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { guestId } = req.params;

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      },
      guestEvents: {
        include: {
          event: true
        }
      },
      rsvp: true
    }
  });

  if (!guest || guest.invitation.userId !== userId) {
    throw new AppError('Guest not found', 404);
  }

  res.json({
    success: true,
    data: guest
  });
});

// Create guest
export const createGuest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  const validationResult = createGuestSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(validationResult.error.issues[0].message, 400);
  }

  const { name, mobile, email, groupName, eventIds } = validationResult.data;

  // Check for duplicate mobile
  const existingGuest = await prisma.guest.findFirst({
    where: { invitationId, mobile }
  });

  if (existingGuest) {
    throw new AppError('Guest with this mobile number already exists', 409);
  }

  // Generate unique token
  let personalToken = generateToken();
  let tokenExists = await prisma.guest.findUnique({ where: { personalToken } });
  while (tokenExists) {
    personalToken = generateToken();
    tokenExists = await prisma.guest.findUnique({ where: { personalToken } });
  }

  // Create guest
  const guest = await prisma.guest.create({
    data: {
      invitationId,
      name,
      mobile,
      email,
      groupName,
      personalToken,
      personalizedLink: `${process.env.APP_URL}/i/${invitation.slug}/${personalToken}`
    }
  });

  // Assign events if provided
  if (eventIds && eventIds.length > 0) {
    await prisma.guestEvent.createMany({
      data: eventIds.map(eventId => ({
        guestId: guest.id,
        eventId
      }))
    });
  }

  // Update invitation guest count
  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      guestCount: {
        increment: 1
      }
    }
  });

  res.status(201).json({
    success: true,
    data: guest
  });
});

// Update guest
export const updateGuest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { guestId } = req.params;

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      }
    }
  });

  if (!guest || guest.invitation.userId !== userId) {
    throw new AppError('Guest not found', 404);
  }

  const validationResult = updateGuestSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(validationResult.error.issues[0].message, 400);
  }

  const { name, mobile, email, groupName, eventIds } = validationResult.data;

  // Check for duplicate mobile if changing
  if (mobile && mobile !== guest.mobile) {
    const existingGuest = await prisma.guest.findFirst({
      where: { 
        invitationId: guest.invitationId, 
        mobile,
        id: { not: guestId }
      }
    });

    if (existingGuest) {
      throw new AppError('Guest with this mobile number already exists', 409);
    }
  }

  // Update guest
  const updatedGuest = await prisma.guest.update({
    where: { id: guestId },
    data: {
      ...(name && { name }),
      ...(mobile && { mobile }),
      ...(email !== undefined && { email }),
      ...(groupName !== undefined && { groupName })
    }
  });

  // Update event assignments if provided
  if (eventIds !== undefined) {
    // Remove existing assignments
    await prisma.guestEvent.deleteMany({
      where: { guestId }
    });

    // Add new assignments
    if (eventIds.length > 0) {
      await prisma.guestEvent.createMany({
        data: eventIds.map(eventId => ({
          guestId,
          eventId
        }))
      });
    }
  }

  res.json({
    success: true,
    data: updatedGuest
  });
});

// Delete guest
export const deleteGuest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { guestId } = req.params;

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      }
    }
  });

  if (!guest || guest.invitation.userId !== userId) {
    throw new AppError('Guest not found', 404);
  }

  await prisma.guest.delete({
    where: { id: guestId }
  });

  // Update invitation guest count
  await prisma.invitation.update({
    where: { id: guest.invitationId },
    data: {
      guestCount: {
        decrement: 1
      }
    }
  });

  res.json({
    success: true,
    message: 'Guest deleted successfully'
  });
});

// Import guests from Excel
export const importGuests = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId },
    include: {
      events: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // Parse Excel file
  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const errors: any[] = [];
  const validGuests: any[] = [];
  let skipped = 0;

  // Validate data
  for (let i = 0; i < data.length; i++) {
    const row = data[i] as any;
    const rowNumber = i + 2; // Excel rows start at 2 (after header)

    // Skip empty rows
    if (!row.Name && !row.name) {
      skipped++;
      continue;
    }

    const name = row.Name || row.name;
    const mobile = String(row.Mobile || row.mobile || '').trim();
    const email = row.Email || row.email || '';
    const eventsStr = row.Events || row.events || '';

    // Validate name
    if (!name || name.trim().length < 2) {
      errors.push({
        row: rowNumber,
        field: 'Name',
        message: 'Name is required and must be at least 2 characters'
      });
      continue;
    }

    // Validate mobile
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      errors.push({
        row: rowNumber,
        field: 'Mobile',
        message: 'Valid 10-digit mobile number is required'
      });
      continue;
    }

    // Check for duplicate mobile in this import
    if (validGuests.some(g => g.mobile === mobile)) {
      errors.push({
        row: rowNumber,
        field: 'Mobile',
        message: 'Duplicate mobile number in import'
      });
      continue;
    }

    // Parse events
    const eventNames = eventsStr.split(',').map((e: string) => e.trim()).filter(Boolean);
    const eventIds: string[] = [];

    for (const eventName of eventNames) {
      const event = invitation.events.find(
        e => e.name.toLowerCase() === eventName.toLowerCase()
      );
      if (event) {
        eventIds.push(event.id);
      }
    }

    validGuests.push({
      name: name.trim(),
      mobile,
      email: email.trim() || null,
      eventIds
    });
  }

  // Import valid guests
  const importedGuests = [];
  for (const guestData of validGuests) {
    let personalToken = generateToken();
    let tokenExists = await prisma.guest.findUnique({ where: { personalToken } });
    while (tokenExists) {
      personalToken = generateToken();
      tokenExists = await prisma.guest.findUnique({ where: { personalToken } });
    }

    const guest = await prisma.guest.create({
      data: {
        invitationId,
        name: guestData.name,
        mobile: guestData.mobile,
        email: guestData.email,
        personalToken,
        personalizedLink: `${process.env.APP_URL}/i/${invitation.slug}/${personalToken}`
      }
    });

    // Assign events
    if (guestData.eventIds.length > 0) {
      await prisma.guestEvent.createMany({
        data: guestData.eventIds.map((eventId: string) => ({
          guestId: guest.id,
          eventId
        }))
      });
    }

    importedGuests.push(guest);
  }

  // Update invitation guest count
  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      guestCount: {
        increment: importedGuests.length
      }
    }
  });

  res.json({
    success: true,
    data: {
      imported: importedGuests.length,
      skipped,
      errors,
      guests: importedGuests
    }
  });
});

// Assign events to guest
export const assignEvents = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { guestId } = req.params;
  const { eventIds } = req.body;

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      }
    }
  });

  if (!guest || guest.invitation.userId !== userId) {
    throw new AppError('Guest not found', 404);
  }

  // Remove existing assignments
  await prisma.guestEvent.deleteMany({
    where: { guestId }
  });

  // Add new assignments
  if (eventIds && eventIds.length > 0) {
    await prisma.guestEvent.createMany({
      data: eventIds.map((eventId: string) => ({
        guestId,
        eventId
      }))
    });
  }

  res.json({
    success: true,
    message: 'Events assigned successfully'
  });
});

// Regenerate guest link
export const regenerateLink = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { guestId } = req.params;

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true,
          slug: true
        }
      }
    }
  });

  if (!guest || guest.invitation.userId !== userId) {
    throw new AppError('Guest not found', 404);
  }

  // Generate new token
  let personalToken = generateToken();
  let tokenExists = await prisma.guest.findUnique({ where: { personalToken } });
  while (tokenExists) {
    personalToken = generateToken();
    tokenExists = await prisma.guest.findUnique({ where: { personalToken } });
  }

  const updatedGuest = await prisma.guest.update({
    where: { id: guestId },
    data: {
      personalToken,
      personalizedLink: `${process.env.APP_URL}/i/${guest.invitation.slug}/${personalToken}`
    }
  });

  res.json({
    success: true,
    data: updatedGuest
  });
});
