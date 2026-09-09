import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';
import { Router } from 'express';
import { AutomationController } from '../controllers/automation.controller';
import { authenticate } from '../middleware/auth';
import { resolveTenant } from '../middleware/tenant';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', AutomationController.getAutomations);
router.post('/', AutomationController.createAutomation);
router.patch('/:id/status', AutomationController.updateStatus);

router.post('/:id/steps', async (req, res, next) => {
  try {
    const record = await supabase
      .from('automations')
      .select('id')
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .single();
    if (record.error) throw new AppError('Automation not found', 404);
    const { type, config } = req.body;
    if (!['task', 'delay', 'sms', 'email'].includes(type))
      throw new AppError('Invalid step type', 400);
    const last = await supabase
      .from('automation_steps')
      .select('step_order')
      .eq('automation_id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .order('step_order', { ascending: false })
      .limit(1);
    if (last.error) throw new AppError(last.error.message, 503);
    const result = await supabase
      .from('automation_steps')
      .insert({
        automation_id: req.params.id,
        dealership_id: req.tenant.dealershipId,
        type,
        config,
        step_order: (last.data?.[0]?.step_order ?? -1) + 1,
      })
      .select()
      .single();
    if (result.error) throw new AppError(result.error.message, 400);
    res.json({ success: true, data: result.data });
  } catch (e) {
    next(e);
  }
});
router.patch('/:id/steps/:stepId', async (req, res, next) => {
  try {
    const result = await supabase
      .from('automation_steps')
      .delete()
      .eq('automation_id', req.params.id)
      .eq('id', req.params.stepId)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();
    if (result.error) throw new AppError('Step not found', 404);
    res.json({ success: true, data: result.data });
  } catch (e) {
    next(e);
  }
});
export default router;
