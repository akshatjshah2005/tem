import { Router } from 'express';
import {
  getTemplates,
  getTemplate,
  getTemplateBySlug,
  getCategories,
  adminGetTemplates,
  adminCreateTemplate,
  adminUpdateTemplate,
  adminPublishTemplate,
  adminUnpublishTemplate,
  adminDeleteTemplate
} from '../controllers/template.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getTemplates);
router.get('/categories', getCategories);
router.get('/slug/:slug', getTemplateBySlug);

// Admin routes (before /:id so they are not swallowed)
router.get('/admin/all', authenticate, authorize('ADMIN'), adminGetTemplates);
router.post('/admin', authenticate, authorize('ADMIN'), adminCreateTemplate);
router.put('/admin/:id', authenticate, authorize('ADMIN'), adminUpdateTemplate);
router.put('/admin/:id/publish', authenticate, authorize('ADMIN'), adminPublishTemplate);
router.put('/admin/:id/unpublish', authenticate, authorize('ADMIN'), adminUnpublishTemplate);
router.delete('/admin/:id', authenticate, authorize('ADMIN'), adminDeleteTemplate);

router.get('/:id', getTemplate);

export { router as templateRoutes };
