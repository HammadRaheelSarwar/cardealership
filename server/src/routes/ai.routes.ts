import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { resolveTenant } from '../middleware/tenant';

const router = Router();

router.use(authenticate, resolveTenant);

router.post('/suggest-reply', AIController.suggestReply);
router.post('/summarize-lead', AIController.summarizeLead);
router.post('/command', AIController.processCommand);

export default router;
