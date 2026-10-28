import { Router } from 'express';
import multer from 'multer';
import {
  uploadMedia,
  getMedia,
  deleteMedia,
  updateGalleryOrder,
  setCoverImage
} from '../controllers/media.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit for portrait invitation clips
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, or WebM.'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/invitation/:invitationId', upload.single('file'), uploadMedia);
router.get('/invitation/:invitationId', getMedia);
router.delete('/:mediaId', deleteMedia);
router.put('/invitation/:invitationId/reorder', updateGalleryOrder);
router.put('/:mediaId/cover', setCoverImage);

export { router as mediaRoutes };
