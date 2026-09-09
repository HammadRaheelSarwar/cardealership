import { Router } from 'express';
import { authenticate, resolveTenant, requireRole } from '../middleware/auth';
import {
  getSalespersonWorkspace,
  getManagerWorkspace,
  getOwnerWorkspace,
  completeTaskWithOutcome,
  markLeadSold,
  markLeadLost,
} from '../controllers/workspace.controller';

const router = Router();

// All workspace routes require authentication and dealership tenant context
router.use(authenticate, resolveTenant);

// 1. Salesperson Workspace (Narrowed strictly to salesperson)
router.get('/salesperson', requireRole('salesperson'), getSalespersonWorkspace);

// 2. Manager Workspace (Manager + Owner)
router.get('/manager', requireRole('manager', 'owner'), getManagerWorkspace);

// 3. Owner Workspace (Owner only)
router.get('/owner', requireRole('owner'), getOwnerWorkspace);

// 4. Task completion with outcome and stage transition
router.post('/tasks/:id/complete', requireRole('salesperson', 'manager', 'owner'), completeTaskWithOutcome);

// 5. Deal outcome exit actions
router.post('/leads/:id/sold', requireRole('salesperson', 'manager', 'owner'), markLeadSold);
router.post('/leads/:id/lost', requireRole('salesperson', 'manager', 'owner'), markLeadLost);

export default router;
