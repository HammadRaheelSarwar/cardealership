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

export type TaskActionType =
  | 'call'
  | 'text'
  | 'email'
  | 'follow_up'
  | 'confirm_appointment'
  | 'test_drive'
  | 'send_numbers'
  | 'general';

export type TaskOutcome =
  | 'no_answer'
  | 'spoke_with_customer'
  | 'appointment_set'
  | 'follow_up_needed'
  | 'not_interested'
  | 'purchased_elsewhere'
  | 'moved_to_next_stage';

export type LostReason =
  | 'no_response'
  | 'purchased_elsewhere'
  | 'price'
  | 'financing'
  | 'vehicle_unavailable'
  | 'not_interested'
  | 'duplicate'
  | 'other';

export type DateRangePreset = 'today' | '7d' | '30d' | 'mtd' | 'custom';

// ─── Default Stages Definition ────────────────────────────────────────────────
export const DEFAULT_PIPELINE_STAGES = [
  { name: 'New Lead', slug: 'new-lead', sortOrder: 0, type: 'standard', color: '#3B82F6' },
  { name: 'Contacted', slug: 'contacted', sortOrder: 1, type: 'standard', color: '#8B5CF6' },
  { name: 'Appointment Set', slug: 'appointment-set', sortOrder: 2, type: 'standard', color: '#06B6D4' },
  { name: 'Show / Test Drive', slug: 'show-test-drive', sortOrder: 3, type: 'standard', color: '#D4AF37' },
  { name: 'Working Deal', slug: 'working-deal', sortOrder: 4, type: 'standard', color: '#F97316' },
  { name: 'Sold', slug: 'sold', sortOrder: 5, type: 'won', color: '#22C55E' },
  { name: 'Lost', slug: 'lost', sortOrder: 6, type: 'lost', color: '#EF4444' },
] as const;

export const RECOMMENDED_STAGE_TASKS: Record<string, TaskActionType[]> = {
  'new-lead': ['call', 'text', 'email'],
  'contacted': ['follow_up', 'call', 'confirm_appointment'],
  'appointment-set': ['confirm_appointment', 'text'],
  'show-test-drive': ['follow_up', 'send_numbers'],
  'working-deal': ['follow_up', 'send_numbers', 'call'],
  'sold': [],
  'lost': [],
};

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

// ─── Role Workspace DTOs ──────────────────────────────────────────────────────

export interface StageTaskCount {
  stageId: string;
  name: string;
  slug: string;
  color: string;
  customerCount: number;
  tasksDueCount: number;
  tasksOverdueCount?: number;
}

export interface NextBestTask {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone?: string;
  vehicle: string;
  actionType: TaskActionType;
  title: string;
  reason: string;
  inquiryTimeAgo?: string;
}

export interface DoNextTaskItem {
  id: string;
  leadId: string;
  customerId: string;
  customerName: string;
  vehicle: string;
  stageName: string;
  stageSlug: string;
  actionType: TaskActionType;
  title: string;
  dueTime: string;
  dueAt: string;
  priority: LeadPriority;
  isOverdue: boolean;
  isDueToday: boolean;
  lastContactText?: string;
  lastMessageText?: string;
}

export interface SalespersonWorkspaceData {
  salespersonName: string;
  tasksRemainingToday: number;
  initialTasksTodayCount: number;
  activePipeline: StageTaskCount[];
  results: {
    soldThisMonth: number;
    soldRevenueThisMonth: number;
    lostThisMonth: number;
  };
  nextBestTask: NextBestTask | null;
  doNextTasks: DoNextTaskItem[];
}

export interface OverdueSalespersonBreakdown {
  salespersonId: string;
  salespersonName: string;
  avatarUrl?: string;
  overdueCount: number;
  tasks: Array<{
    id: string;
    leadId: string;
    customerName: string;
    vehicle: string;
    title: string;
    dueAt: string;
    daysOverdue: number;
  }>;
}

export interface SalespersonPerformanceMetric {
  id: string;
  name: string;
  avatarUrl?: string;
  activeLeads: number;
  tasksDue: number;
  overdueTasks: number;
  appointmentsToday: number;
  callsMade: number;
  textsSent: number;
  emailsSent: number;
  showRate: number;
  soldUnits: number;
  conversionRate: number;
  taskCompletionRate: number;
}

export interface CoachingInsight {
  id: string;
  salespersonId: string;
  salespersonName: string;
  type: 'warning' | 'info' | 'positive';
  metricHighlight: string;
  insight: string;
  actionRecommendation: string;
}

export interface ManagerWorkspaceData {
  managerName: string;
  teamPipeline: StageTaskCount[];
  totalOverdueTasks: number;
  overdueBySalesperson: OverdueSalespersonBreakdown[];
  salespeople: SalespersonPerformanceMetric[];
  coachingInsights: CoachingInsight[];
  dateRange: DateRangePreset;
}

export interface ManagerTeamComparison {
  managerId: string;
  managerName: string;
  teamName: string;
  pipelineCount: number;
  appointmentsCount: number;
  showsCount: number;
  soldUnits: number;
  conversionRate: number;
  grossProfit?: number;
  netProfit?: number;
}

export interface PipelineDropOffStep {
  fromStage: string;
  toStage: string;
  conversionRate: number;
  dropOffRate: number;
  isHighestDropOff: boolean;
}

export interface LostReasonStat {
  reason: string;
  count: number;
  percentage: number;
}

export interface OwnerWorkspaceData {
  dealershipName: string;
  totalActiveOpportunities: number;
  appointmentsCount: number;
  showsCount: number;
  showRate: number;
  workingDealsCount: number;
  unitsSold: number;
  overallConversionRate: number;
  salesVolume: number;
  financialsVisible: boolean;
  grossProfit?: number;
  netProfit?: number;
  managerComparisons: ManagerTeamComparison[];
  pipelineFunnel: PipelineDropOffStep[];
  lostReasons: LostReasonStat[];
  dateRange: DateRangePreset;
}

