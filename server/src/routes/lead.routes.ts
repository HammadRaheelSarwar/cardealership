import { Router } from 'express';
import {
  getLeads,
  createLead,
  getLead,
  updateLeadStage,
  assignLead,
  updateLeadTemperature,
  markLeadLost,
  markLeadSold,
  getLeadActivity,
} from '../controllers/lead.controller';
import { authenticate, resolveTenant } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createLeadSchema,
  leadQuerySchema,
  updateLeadStageSchema,
  assignLeadSchema,
  updateLeadTemperatureSchema,
  markLeadLostSchema,
  markLeadSoldSchema,
} from '../validators/lead.validator';

const router = Router();

router.use(authenticate);
router.use(resolveTenant);

router.get('/', validate(leadQuerySchema, 'query'), getLeads);
router.post('/', validate(createLeadSchema), createLead);
router.get('/:id', getLead);
router.patch('/:id/stage', validate(updateLeadStageSchema), updateLeadStage);
router.patch('/:id/assign', validate(assignLeadSchema), assignLead);
router.patch('/:id/temperature', validate(updateLeadTemperatureSchema), updateLeadTemperature);
router.post('/:id/lost', validate(markLeadLostSchema), markLeadLost);
router.post('/:id/sold', validate(markLeadSoldSchema), markLeadSold);
router.get('/:id/activity', getLeadActivity);

export default router;
