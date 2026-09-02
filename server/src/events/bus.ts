import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface TenantContext {
  dealershipId: string;
  membershipId: string;
  role: string;
  permissions: string[];
}

export interface LeadEventPayload {
  lead: any;
  tenant: TenantContext;
  actor?: any;
  metadata?: Record<string, unknown>;
}

export interface MessageEventPayload {
  messageId: string;
  leadId?: string;
  customerId: string;
  conversationId: string;
  channel: 'sms' | 'email' | 'internal';
  direction: 'inbound' | 'outbound';
  tenant: TenantContext;
  actor?: any;
}

export interface TaskEventPayload {
  taskId: string;
  leadId?: string;
  customerId?: string;
  tenant: TenantContext;
  actor?: any;
}

export interface AppointmentEventPayload {
  appointmentId: string;
  leadId?: string;
  customerId?: string;
  tenant: TenantContext;
  actor?: any;
}

export interface DomainEventMap {
  'lead.created': LeadEventPayload;
  'lead.updated': LeadEventPayload;
  'lead.assigned': LeadEventPayload & { previousAssignedUserId?: string };
  'lead.stage.changed': LeadEventPayload & {
    fromStageId: string;
    toStageId: string;
  };
  'lead.won': LeadEventPayload;
  'lead.lost': LeadEventPayload;
  'lead.temperature.changed': LeadEventPayload;
  'message.sent': MessageEventPayload;
  'message.received': MessageEventPayload;
  'task.created': TaskEventPayload;
  'task.completed': TaskEventPayload;
  'appointment.created': AppointmentEventPayload;
  'appointment.no_show': AppointmentEventPayload;
}

class DomainEventBus extends EventEmitter {
  emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): boolean {
    logger.debug(`[EventBus] ${event}`, { event });
    return super.emit(event, payload);
  }

  on<K extends keyof DomainEventMap>(
    event: K,
    listener: (payload: DomainEventMap[K]) => void | Promise<void>
  ): this {
    super.on(event, async (payload: DomainEventMap[K]) => {
      try {
        await listener(payload);
      } catch (err) {
        logger.error(`[EventBus] Error in listener for "${event}":`, err);
      }
    });
    return this;
  }
}

export const eventBus = new DomainEventBus();
eventBus.setMaxListeners(50);
