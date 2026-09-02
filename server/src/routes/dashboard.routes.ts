import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(resolveTenant);

router.get('/', getDashboardData);

export default router;
