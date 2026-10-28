import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';

// Get all published templates
export const getTemplates = asyncHandler(async (req: Request, res: Response) => {
  const { category, page = 1, limit = 20 } = req.query;

  const where: any = {
    status: 'PUBLISHED'
  };

  if (category) {
    where.category = {
      slug: category as string
    };
  }

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            invitations: true
          }
        }
      },
      orderBy: { popularity: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.template.count({ where })
  ]);

  res.json({
    success: true,
    data: templates,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Get single template
export const getTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Increment popularity
  await prisma.template.update({
    where: { id },
    data: {
      popularity: {
        increment: 1
      }
    }
  });

  res.json({
    success: true,
    data: template
  });
});

// Get template by slug
export const getTemplateBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const template = await prisma.template.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  res.json({
    success: true,
    data: template
  });
});

// Get categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: {
          templates: {
            where: { status: 'PUBLISHED' }
          }
        }
      }
    }
  });

  res.json({
    success: true,
    data: categories
  });
});

// Admin: Get all templates
export const adminGetTemplates = asyncHandler(async (req: Request, res: Response) => {
  const { status, category, page = 1, limit = 20 } = req.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (category) {
    where.categoryId = category;
  }

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            invitations: true,
            versions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.template.count({ where })
  ]);

  res.json({
    success: true,
    data: templates,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// Admin: Create template
export const adminCreateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const {
    categoryId,
    name,
    slug,
    description,
    thumbnailUrl,
    previewUrl,
    config,
    features,
    editableFields,
    variables,
    isPremium
  } = req.body;

  // Check if slug already exists
  const existingTemplate = await prisma.template.findUnique({
    where: { slug }
  });

  if (existingTemplate) {
    throw new AppError('Template with this slug already exists', 409);
  }

  const template = await prisma.template.create({
    data: {
      categoryId,
      name,
      slug,
      description,
      thumbnailUrl,
      previewUrl,
      config: config || {},
      features: features || {},
      editableFields: editableFields || {},
      variables: variables || {},
      isPremium: isPremium || false
    }
  });

  res.status(201).json({
    success: true,
    data: template
  });
});

// Admin: Update template
export const adminUpdateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const template = await prisma.template.findUnique({
    where: { id }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  const updatedTemplate = await prisma.template.update({
    where: { id },
    data: updateData
  });

  res.json({
    success: true,
    data: updatedTemplate
  });
});

// Admin: Publish template
export const adminPublishTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const template = await prisma.template.findUnique({
    where: { id }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  const updatedTemplate = await prisma.template.update({
    where: { id },
    data: { status: 'PUBLISHED' }
  });

  res.json({
    success: true,
    data: updatedTemplate
  });
});

// Admin: Unpublish template
export const adminUnpublishTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const template = await prisma.template.findUnique({
    where: { id }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  const updatedTemplate = await prisma.template.update({
    where: { id },
    data: { status: 'DRAFT' }
  });

  res.json({
    success: true,
    data: updatedTemplate
  });
});

// Admin: Delete template
export const adminDeleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          invitations: true
        }
      }
    }
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  if (template._count.invitations > 0) {
    throw new AppError('Cannot delete template with existing invitations', 400);
  }

  await prisma.template.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Template deleted successfully'
  });
});
