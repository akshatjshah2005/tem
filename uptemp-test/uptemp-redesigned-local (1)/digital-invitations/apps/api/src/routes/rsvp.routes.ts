import { Router } from 'express';
import { submitRsvp, getRsvpStats } from '../controllers/rsvp.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route - guest submits RSVP via token
router.post('/:token', submitRsvp);

// Protected route - get RSVP stats for invitation
router.get('/invitation/:invitationId', authenticate, getRsvpStats);

export { router as rsvpRoutes };
