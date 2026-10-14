import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  reorderEvents
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.get('/invitation/:invitationId', getEvents);
router.get('/:eventId', getEvent);
router.post('/invitation/:invitationId', createEvent);
router.put('/:eventId', updateEvent);
router.delete('/:eventId', deleteEvent);

// Reorder route
router.put('/invitation/:invitationId/reorder', reorderEvents);

export { router as eventRoutes };
