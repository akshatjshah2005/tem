import { Router } from 'express';
import multer from 'multer';
import {
  getGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  importGuests,
  assignEvents,
  regenerateLink
} from '../controllers/guest.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure multer for Excel upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.get('/invitation/:invitationId', getGuests);
router.get('/:guestId', getGuest);
router.post('/invitation/:invitationId', createGuest);
router.put('/:guestId', updateGuest);
router.delete('/:guestId', deleteGuest);

// Import route
router.post(
  '/invitation/:invitationId/import',
  upload.single('file'),
  importGuests
);

// Action routes
router.put('/:guestId/events', assignEvents);
router.post('/:guestId/regenerate-link', regenerateLink);

export { router as guestRoutes };
