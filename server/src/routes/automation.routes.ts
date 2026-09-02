import { Router } from 'express';
import { AutomationController } from '../controllers/automation.controller';
import { authenticate } from '../middleware/auth';
import { resolveTenant } from '../middleware/tenant';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', AutomationController.getAutomations);
router.post('/', AutomationController.createAutomation);
router.patch('/:id/status', AutomationController.updateStatus);

export default router;
