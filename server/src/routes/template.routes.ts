import { Router } from 'express';
import { getTemplates, createTemplate } from '../controllers/template.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', getTemplates);
router.post('/', createTemplate);

export default router;
