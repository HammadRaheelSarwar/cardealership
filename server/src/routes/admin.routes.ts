import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireSuperAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireSuperAdmin);

router.get('/stats', AdminController.getPlatformStats);
router.get('/dealerships', AdminController.getDealerships);
router.patch('/dealerships/:id/status', AdminController.toggleDealershipStatus);

export default router;
