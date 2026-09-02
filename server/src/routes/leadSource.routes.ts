import { Router } from 'express';
import { getLeadSources, createLeadSource } from '../controllers/leadSource.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', getLeadSources);
router.post('/', createLeadSource);

export default router;
