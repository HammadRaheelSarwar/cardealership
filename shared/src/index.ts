// Shared types used by both client and server

export type PlatformRole = 'user' | 'superAdmin';
export type DealershipRole = 'owner' | 'manager' | 'salesperson';
export type MembershipStatus = 'active' | 'invited' | 'deactivated';
export type DealershipStatus = 'trial' | 'active' | 'suspended' | 'cancelled';
export type UserStatus = 'active' | 'invited' | 'suspended';
export type LeadPriority = 'low' | 'medium' | 'high';
export type LeadTemperature = 'cold' | 'warm' | 'hot';
export type LeadStatus = 'open' | 'won' | 'lost' | 'archived';
export type VehicleStatus = 'available' | 'reserved' | 'pending' | 'sold';
export type TaskStatus = 'pending' | 'completed' | 'cancelled';
export type TaskDisplayStatus = 'upcoming' | 'today' | 'overdue' | 'completed' | 'cancelled';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'no-show' | 'cancelled';
export type AppointmentType = 'test-drive' | 'showroom' | 'phone' | 'video' | 'financing';
export type MessageChannel = 'sms' | 'email' | 'internal';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus =
  | 'draft'
  | 'scheduled'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'received'
  | 'failed';
export type ConversationStatus = 'open' | 'closed' | 'archived';
export type AutomationStatus = 'draft' | 'active' | 'paused' | 'archived';

// ─── API Response Shape ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Derived Task Display Status ──────────────────────────────────────────────
// dueAt-based computation — status is NEVER stored as 'today'/'overdue' in DB

export function getTaskDisplayStatus(
  status: TaskStatus,
  dueAt: Date | string
): TaskDisplayStatus {
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';

  const due = new Date(dueAt);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  if (due < todayStart) return 'overdue';
  if (due >= todayStart && due < todayEnd) return 'today';
  return 'upcoming';
}
