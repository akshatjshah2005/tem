import { Router } from 'express';
import {
  getInvitations,
  getInvitation,
  createInvitation,
  updateInvitation,
  deleteInvitation,
  duplicateInvitation,
  publishInvitation,
  unpublishInvitation,
  getPublicInvitation,
  getPersonalizedInvitation
} from '../controllers/invitation.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes (no auth required)
router.get('/public/:slug', getPublicInvitation);
router.get('/public/:slug/:token', getPersonalizedInvitation);

// All routes below require authentication
router.use(authenticate);

// CRUD routes
router.get('/', getInvitations);
router.get('/:id', getInvitation);
router.post('/', createInvitation);
router.put('/:id', updateInvitation);
router.delete('/:id', deleteInvitation);

// Action routes
router.post('/:id/duplicate', duplicateInvitation);
router.put('/:id/publish', publishInvitation);
router.put('/:id/unpublish', unpublishInvitation);

export { router as invitationRoutes };
