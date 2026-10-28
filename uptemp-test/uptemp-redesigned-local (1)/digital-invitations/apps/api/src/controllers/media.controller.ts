import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Upload media
export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const file = req.file;
  const fileId = uuidv4();
  const ext = path.extname(file.originalname);
  const filename = `${fileId}${ext}`;

  // Process image
  let optimizedUrl: string | null = null;
  let thumbnailUrl: string | null = null;
  let width = 0;
  let height = 0;

  if (file.mimetype.startsWith('image/')) {
    // Get image dimensions
    const metadata = await sharp(file.buffer).metadata();
    width = metadata.width || 0;
    height = metadata.height || 0;

    // Save optimized version
    const optimizedPath = path.join(uploadDir, `optimized-${filename}`);
    await sharp(file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(optimizedPath);
    optimizedUrl = `${process.env.CDN_URL || ''}/optimized-${filename}`;

    // Save thumbnail
    const thumbnailPath = path.join(uploadDir, `thumb-${filename}`);
    await sharp(file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 70 })
      .toFile(thumbnailPath);
    thumbnailUrl = `${process.env.CDN_URL || ''}/thumb-${filename}`;
  }

  // Save original file
  const originalPath = path.join(uploadDir, filename);
  fs.writeFileSync(originalPath, file.buffer);

  const lastMedia = await prisma.media.findFirst({
    where: { invitationId },
    orderBy: { galleryOrder: 'desc' },
    select: { galleryOrder: true }
  });

  // Create media record
  const media = await prisma.media.create({
    data: {
      invitationId,
      uploadedBy: userId,
      originalUrl: `${process.env.CDN_URL || ''}/${filename}`,
      optimizedUrl,
      thumbnailUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      width,
      height,
      galleryOrder: (lastMedia?.galleryOrder || 0) + 1
    }
  });

  res.status(201).json({
    success: true,
    data: media
  });
});

// Get media for invitation
export const getMedia = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  const media = await prisma.media.findMany({
    where: { invitationId },
    orderBy: { galleryOrder: 'asc' }
  });

  res.json({
    success: true,
    data: media
  });
});

// Delete media
export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { mediaId } = req.params;

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      }
    }
  });

  if (!media || media.invitation.userId !== userId) {
    throw new AppError('Media not found', 404);
  }

  // Delete files from disk
  const filesToDelete = [
    media.originalUrl,
    media.optimizedUrl,
    media.thumbnailUrl
  ].filter((fileUrl): fileUrl is string => Boolean(fileUrl));

  for (const fileUrl of filesToDelete) {
    const relative = fileUrl.replace(process.env.CDN_URL || 'http://localhost:4000/uploads', '').replace(/^\//, '');
    const filePath = path.join(uploadDir, relative);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Delete from database
  await prisma.media.delete({
    where: { id: mediaId }
  });

  res.json({
    success: true,
    message: 'Media deleted successfully'
  });
});

// Update gallery order
export const updateGalleryOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invitationId } = req.params;
  const { mediaIds } = req.body;

  // Verify invitation belongs to user
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, userId }
  });

  if (!invitation) {
    throw new AppError('Invitation not found', 404);
  }

  // Update order for each media item
  for (let i = 0; i < mediaIds.length; i++) {
    await prisma.media.update({
      where: { id: mediaIds[i] },
      data: { galleryOrder: i + 1 }
    });
  }

  res.json({
    success: true,
    message: 'Gallery order updated successfully'
  });
});

// Set cover image
export const setCoverImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { mediaId } = req.params;

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      invitation: {
        select: {
          id: true,
          userId: true
        }
      }
    }
  });

  if (!media || media.invitation.userId !== userId) {
    throw new AppError('Media not found', 404);
  }

  // Reset all cover flags for this invitation
  await prisma.media.updateMany({
    where: { invitationId: media.invitationId },
    data: { isCover: false }
  });

  // Set this media as cover
  await prisma.media.update({
    where: { id: mediaId },
    data: { isCover: true }
  });

  // Update invitation cover image
  await prisma.invitation.update({
    where: { id: media.invitationId },
    data: { coverImageUrl: media.optimizedUrl || media.originalUrl }
  });

  res.json({
    success: true,
    message: 'Cover image set successfully'
  });
});
