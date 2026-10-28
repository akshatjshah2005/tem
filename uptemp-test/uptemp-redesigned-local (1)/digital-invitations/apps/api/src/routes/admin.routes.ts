import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getAllInvitations,
  getBulkRequests,
  updateBulkRequestStatus
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// Invitations
router.get('/invitations', getAllInvitations);

// Bulk Requests
router.get('/bulk-requests', getBulkRequests);
router.put('/bulk-requests/:id', updateBulkRequestStatus);

export { router as adminRoutes };
