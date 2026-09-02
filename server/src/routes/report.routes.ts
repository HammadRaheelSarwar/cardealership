import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';
import { resolveTenant } from '../middleware/tenant';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/summary', ReportController.getSummary);
router.get('/sources', ReportController.getSourcePerformance);

export default router;
