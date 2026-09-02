import { Router } from 'express';
import authRoutes from './auth.routes';
import dealershipRoutes from './dealership.routes';
import customerRoutes from './customer.routes';
import vehicleRoutes from './vehicle.routes';
import leadRoutes from './lead.routes';
import pipelineRoutes from './pipeline.routes';
import dashboardRoutes from './dashboard.routes';
import messageRoutes from './message.routes';
import taskRoutes from './task.routes';
import appointmentRoutes from './appointment.routes';
import automationRoutes from './automation.routes';
import aiRoutes from './ai.routes';
import searchRoutes from './search.routes';
import notificationRoutes from './notification.routes';
import templateRoutes from './template.routes';
import reportRoutes from './report.routes';
import leadSourceRoutes from './leadSource.routes';
import adminRoutes from './admin.routes';
import integrationRoutes from './integration.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/dealerships', dealershipRoutes);
router.use('/customers', customerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/leads', leadRoutes);
router.use('/pipeline', pipelineRoutes);
router.use('/dashboard', dashboardRoutes);

// Communication, Tasks, Appointments, Integrations & Webhooks
router.use('/messages', messageRoutes);
router.use('/tasks', taskRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/automations', automationRoutes);
router.use('/ai', aiRoutes);
router.use('/search', searchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/templates', templateRoutes);
router.use('/reports', reportRoutes);
router.use('/lead-sources', leadSourceRoutes);
router.use('/integrations', integrationRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/admin', adminRoutes);

export default router;
