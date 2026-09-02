import { Router } from 'express';
import { getIntegrationStatus } from '../controllers/integration.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.get('/status', authenticate, resolveTenant, getIntegrationStatus);

export default router;
