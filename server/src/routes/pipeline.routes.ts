import { Router } from 'express';
import {
  getStages,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
} from '../controllers/pipeline.controller';
import { authenticate, resolveTenant, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(resolveTenant);

router.get('/stages', getStages);
router.post('/stages', requireRole('owner', 'manager'), createStage);
router.patch('/stages/reorder', requireRole('owner', 'manager'), reorderStages);
router.patch('/stages/:id', requireRole('owner', 'manager'), updateStage);
router.delete('/stages/:id', requireRole('owner'), deleteStage);

export default router;
