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
export type TaskActionType = 'call' | 'text' | 'email' | 'follow_up' | 'confirm_appointment' | 'test_drive' | 'send_numbers' | 'general';
export type TaskOutcome = 'no_answer' | 'spoke_with_customer' | 'appointment_set' | 'follow_up_needed' | 'not_interested' | 'purchased_elsewhere' | 'moved_to_next_stage';
export type LostReason = 'no_response' | 'purchased_elsewhere' | 'price' | 'financing' | 'vehicle_unavailable' | 'not_interested' | 'duplicate' | 'other';
export type DateRangePreset = 'today' | '7d' | '30d' | 'mtd' | 'custom';
export declare const DEFAULT_PIPELINE_STAGES: readonly [{
    readonly name: "New Lead";
    readonly slug: "new-lead";
    readonly sortOrder: 0;
    readonly type: "standard";
    readonly color: "#3B82F6";
}, {
    readonly name: "Contacted";
    readonly slug: "contacted";
    readonly sortOrder: 1;
    readonly type: "standard";
    readonly color: "#8B5CF6";
}, {
    readonly name: "Appointment Set";
    readonly slug: "appointment-set";
    readonly sortOrder: 2;
    readonly type: "standard";
    readonly color: "#06B6D4";
}, {
    readonly name: "Show / Test Drive";
    readonly slug: "show-test-drive";
    readonly sortOrder: 3;
    readonly type: "standard";
    readonly color: "#D4AF37";
}, {
    readonly name: "Working Deal";
    readonly slug: "working-deal";
    readonly sortOrder: 4;
    readonly type: "standard";
    readonly color: "#F97316";
}, {
    readonly name: "Sold";
    readonly slug: "sold";
    readonly sortOrder: 5;
    readonly type: "won";
    readonly color: "#22C55E";
}, {
    readonly name: "Lost";
    readonly slug: "lost";
    readonly sortOrder: 6;
    readonly type: "lost";
    readonly color: "#EF4444";
}];
export declare const RECOMMENDED_STAGE_TASKS: Record<string, TaskActionType[]>;
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'no-show' | 'cancelled';
export type AppointmentType = 'test-drive' | 'showroom' | 'phone' | 'video' | 'financing';
export type MessageChannel = 'sms' | 'email' | 'internal';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'draft' | 'scheduled' | 'queued' | 'sent' | 'delivered' | 'received' | 'failed';
export type ConversationStatus = 'open' | 'closed' | 'archived';
export type AutomationStatus = 'draft' | 'active' | 'paused' | 'archived';
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
export declare function getTaskDisplayStatus(status: TaskStatus, dueAt: Date | string): TaskDisplayStatus;
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
//# sourceMappingURL=index.d.ts.map