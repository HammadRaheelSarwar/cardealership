import api from './api';
import type {
  SalespersonWorkspaceData,
  ManagerWorkspaceData,
  OwnerWorkspaceData,
  TaskOutcome,
  LostReason,
  DateRangePreset,
} from '@crm/shared';

// STRICT MOCK ISOLATION RULE:
// Mock fallback is ONLY allowed if VITE_DEMO_MODE === 'true' or in development demo mode.
// In production without this flag, real API failures MUST throw.
const IS_DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  (import.meta.env.DEV && !import.meta.env.VITE_API_URL);

// ─── Salesperson Workspace ───────────────────────────────────────────────────

export async function fetchSalespersonWorkspace(): Promise<SalespersonWorkspaceData> {
  try {
    const res = await api.get('/workspace/salesperson');
    return res.data.data;
  } catch (err) {
    if (IS_DEMO_MODE) {
      console.info('[Demo Mode] Serving mock Salesperson Workspace data');
      return getMockSalespersonWorkspace();
    }
    throw err;
  }
}

// ─── Manager Workspace ───────────────────────────────────────────────────────

export async function fetchManagerWorkspace(
  range: DateRangePreset = 'mtd'
): Promise<ManagerWorkspaceData> {
  try {
    const res = await api.get(`/workspace/manager?range=${range}`);
    return res.data.data;
  } catch (err) {
    if (IS_DEMO_MODE) {
      console.info('[Demo Mode] Serving mock Manager Workspace data');
      return getMockManagerWorkspace(range);
    }
    throw err;
  }
}

// ─── Owner Workspace ─────────────────────────────────────────────────────────

export async function fetchOwnerWorkspace(
  range: DateRangePreset = 'mtd'
): Promise<OwnerWorkspaceData> {
  try {
    const res = await api.get(`/workspace/owner?range=${range}`);
    return res.data.data;
  } catch (err) {
    if (IS_DEMO_MODE) {
      console.info('[Demo Mode] Serving mock Owner Workspace data');
      return getMockOwnerWorkspace(range);
    }
    throw err;
  }
}

// ─── Task Completion Workflow ────────────────────────────────────────────────

export async function completeTask(
  taskId: string,
  payload: {
    outcome: TaskOutcome;
    note?: string;
    nextTask?: {
      type: string;
      title: string;
      dueAt: string;
      description?: string;
    };
    lostReason?: LostReason;
  }
) {
  try {
    const res = await api.post(`/workspace/tasks/${taskId}/complete`, payload);
    return res.data.data;
  } catch (err) {
    if (IS_DEMO_MODE) {
      console.info('[Demo Mode] Mock task completed:', taskId, payload);
      return { taskId, outcome: payload.outcome, success: true };
    }
    throw err;
  }
}

// ─── Mark Lead Sold ──────────────────────────────────────────────────────────

export async function markLeadSold(
  leadId: string,
  payload: {
    saleValue: number;
    vehicleId?: string;
    grossProfit?: number;
    netProfit?: number;
  }
) {
  try {
    const res = await api.post(`/workspace/leads/${leadId}/sold`, payload);
    return res.data.data;
  } catch (err) {
    if (IS_DEMO_MODE) {
      console.info('[Demo Mode] Mock lead marked Sold:', leadId, payload);
      return { leadId, success: true };
    }
    throw err;
  }
}

// ─── Mark Lead Lost ──────────────────────────────────────────────────────────

export async function markLeadLost(
  leadId: string,
  payload: {
    lostReason: LostReason;
  }
) {
  try {
    const res = await api.post(`/workspace/leads/${leadId}/lost`, payload);
    return res.data.data;
  } catch (err) {
    if (IS_DEMO_MODE) {
      console.info('[Demo Mode] Mock lead marked Lost:', leadId, payload);
      return { leadId, success: true };
    }
    throw err;
  }
}

// ============================================================================
// DEMO MOCK DATA PROVIDERS (Gated strictly behind VITE_DEMO_MODE)
// ============================================================================

function getMockSalespersonWorkspace(): SalespersonWorkspaceData {
  return {
    salespersonName: 'Sarah Parker',
    tasksRemainingToday: 11,
    initialTasksTodayCount: 11,
    activePipeline: [
      {
        stageId: 'st-new',
        name: 'New Lead',
        slug: 'new-lead',
        color: '#3B82F6',
        customerCount: 28,
        tasksDueCount: 6,
      },
      {
        stageId: 'st-contacted',
        name: 'Contacted',
        slug: 'contacted',
        color: '#8B5CF6',
        customerCount: 19,
        tasksDueCount: 3,
      },
      {
        stageId: 'st-appt',
        name: 'Appointment Set',
        slug: 'appointment-set',
        color: '#06B6D4',
        customerCount: 9,
        tasksDueCount: 2,
      },
      {
        stageId: 'st-show',
        name: 'Show / Test Drive',
        slug: 'show-test-drive',
        color: '#D4AF37',
        customerCount: 5,
        tasksDueCount: 0,
      },
      {
        stageId: 'st-deal',
        name: 'Working Deal',
        slug: 'working-deal',
        color: '#F97316',
        customerCount: 3,
        tasksDueCount: 0,
      },
    ],
    results: {
      soldThisMonth: 2,
      soldRevenueThisMonth: 68500,
      lostThisMonth: 1,
    },
    nextBestTask: {
      id: 'task-1',
      leadId: 'lead-1',
      customerName: 'John Carter',
      customerPhone: '+1 (555) 301-4492',
      vehicle: '2024 Toyota Camry XSE',
      actionType: 'call',
      title: 'Call John Carter',
      reason: 'New leads should be contacted first.',
      inquiryTimeAgo: '24 minutes ago',
    },
    doNextTasks: [
      {
        id: 'task-1',
        leadId: 'lead-1',
        customerId: 'cust-1',
        customerName: 'John Carter',
        vehicle: '2024 Toyota Camry XSE',
        stageName: 'New Lead',
        stageSlug: 'new-lead',
        actionType: 'call',
        title: 'Call John Carter',
        dueTime: '10:30 AM',
        dueAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        priority: 'high',
        isOverdue: false,
        isDueToday: true,
        lastContactText: 'New inquiry 24m ago',
        lastMessageText: 'Can I come see it tomorrow?',
      },
      {
        id: 'task-2',
        leadId: 'lead-2',
        customerId: 'cust-2',
        customerName: 'Sarah Williams',
        vehicle: '2023 BMW 330i xDrive',
        stageName: 'Contacted',
        stageSlug: 'contacted',
        actionType: 'text',
        title: 'Text Sarah Williams',
        dueTime: '11:00 AM',
        dueAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        priority: 'high',
        isOverdue: false,
        isDueToday: true,
        lastContactText: 'Yesterday 4:15 PM',
        lastMessageText: 'Sent window sticker and CARFAX link',
      },
      {
        id: 'task-3',
        leadId: 'lead-3',
        customerId: 'cust-3',
        customerName: 'Mike Thompson',
        vehicle: '2024 Ford F-150 Lariat',
        stageName: 'Contacted',
        stageSlug: 'contacted',
        actionType: 'email',
        title: 'Email Mike Thompson',
        dueTime: '11:30 AM',
        dueAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        priority: 'medium',
        isOverdue: false,
        isDueToday: true,
        lastContactText: '2 days ago',
        lastMessageText: 'Requested pricing on towing package',
      },
      {
        id: 'task-4',
        leadId: 'lead-4',
        customerId: 'cust-4',
        customerName: 'Emily Davis',
        vehicle: '2024 Honda CR-V Touring',
        stageName: 'Appointment Set',
        stageSlug: 'appointment-set',
        actionType: 'confirm_appointment',
        title: 'Confirm test drive with Emily Davis',
        dueTime: '1:00 PM',
        dueAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
        priority: 'high',
        isOverdue: false,
        isDueToday: true,
        lastContactText: 'Yesterday 2:00 PM',
        lastMessageText: 'Confirmed 3:00 PM appointment slot',
      },
      {
        id: 'task-5',
        leadId: 'lead-5',
        customerId: 'cust-5',
        customerName: 'David Martinez',
        vehicle: '2024 Lexus RX 350',
        stageName: 'Show / Test Drive',
        stageSlug: 'show-test-drive',
        actionType: 'follow_up',
        title: 'Follow up after showroom visit',
        dueTime: '2:30 PM',
        dueAt: new Date(Date.now() + 200 * 60 * 1000).toISOString(),
        priority: 'medium',
        isOverdue: false,
        isDueToday: true,
        lastContactText: 'Completed test drive this morning',
        lastMessageText: 'Loved the quiet cabin, reviewing trade-in value',
      },
    ],
  };
}

function getMockManagerWorkspace(range: DateRangePreset): ManagerWorkspaceData {
  return {
    managerName: 'Shane Miller',
    teamPipeline: [
      {
        stageId: 'st-new',
        name: 'New Lead',
        slug: 'new-lead',
        color: '#3B82F6',
        customerCount: 80,
        tasksDueCount: 14,
        tasksOverdueCount: 14,
      },
      {
        stageId: 'st-contacted',
        name: 'Contacted',
        slug: 'contacted',
        color: '#8B5CF6',
        customerCount: 52,
        tasksDueCount: 9,
        tasksOverdueCount: 4,
      },
      {
        stageId: 'st-appt',
        name: 'Appointment Set',
        slug: 'appointment-set',
        color: '#06B6D4',
        customerCount: 25,
        tasksDueCount: 6,
        tasksOverdueCount: 1,
      },
      {
        stageId: 'st-show',
        name: 'Show / Test Drive',
        slug: 'show-test-drive',
        color: '#D4AF37',
        customerCount: 14,
        tasksDueCount: 3,
        tasksOverdueCount: 0,
      },
      {
        stageId: 'st-deal',
        name: 'Working Deal',
        slug: 'working-deal',
        color: '#F97316',
        customerCount: 8,
        tasksDueCount: 2,
        tasksOverdueCount: 0,
      },
      {
        stageId: 'st-sold',
        name: 'Sold',
        slug: 'sold',
        color: '#22C55E',
        customerCount: 7,
        tasksDueCount: 0,
        tasksOverdueCount: 0,
      },
    ],
    totalOverdueTasks: 14,
    overdueBySalesperson: [
      {
        salespersonId: 'rep-sarah',
        salespersonName: 'Sarah Parker',
        overdueCount: 6,
        tasks: [
          {
            id: 't-s1',
            leadId: 'l-s1',
            customerName: 'Marcus Vance',
            vehicle: '2024 Mercedes GLC 300',
            title: 'Initial phone contact',
            dueAt: 'Yesterday 10:00 AM',
            daysOverdue: 1,
          },
          {
            id: 't-s2',
            leadId: 'l-s2',
            customerName: 'Rachel Green',
            vehicle: '2023 Audi Q5 45',
            title: 'Follow-up on financing inquiry',
            dueAt: '2 days ago',
            daysOverdue: 2,
          },
          {
            id: 't-s3',
            leadId: 'l-s3',
            customerName: 'Brandon Walsh',
            vehicle: '2024 Ford F-150',
            title: 'Send trade valuation options',
            dueAt: '3 days ago',
            daysOverdue: 3,
          },
        ],
      },
      {
        salespersonId: 'rep-michael',
        salespersonName: 'Michael Brown',
        overdueCount: 5,
        tasks: [
          {
            id: 't-m1',
            leadId: 'l-m1',
            customerName: 'Thomas Anderson',
            vehicle: '2024 Toyota RAV4 Hybrid',
            title: 'Send digital buyer quote',
            dueAt: 'Yesterday 3:00 PM',
            daysOverdue: 1,
          },
          {
            id: 't-m2',
            leadId: 'l-m2',
            customerName: 'Claire Bennett',
            vehicle: '2023 Hyundai Palisade',
            title: 'Call to confirm test drive slot',
            dueAt: '2 days ago',
            daysOverdue: 2,
          },
        ],
      },
      {
        salespersonId: 'rep-james',
        salespersonName: 'James Wilson',
        overdueCount: 3,
        tasks: [
          {
            id: 't-j1',
            leadId: 'l-j1',
            customerName: 'Carlos Ramirez',
            vehicle: '2024 Chevrolet Silverado 1500',
            title: 'Call customer regarding down payment',
            dueAt: 'Yesterday 4:00 PM',
            daysOverdue: 1,
          },
        ],
      },
    ],
    salespeople: [
      {
        id: 'rep-sarah',
        name: 'Sarah Parker',
        activeLeads: 34,
        tasksDue: 6,
        overdueTasks: 6,
        appointmentsToday: 2,
        callsMade: 38,
        textsSent: 45,
        emailsSent: 24,
        showRate: 58,
        soldUnits: 3,
        conversionRate: 8.8,
        taskCompletionRate: 94,
      },
      {
        id: 'rep-michael',
        name: 'Michael Brown',
        activeLeads: 28,
        tasksDue: 5,
        overdueTasks: 5,
        appointmentsToday: 1,
        callsMade: 14,
        textsSent: 18,
        emailsSent: 8,
        showRate: 52,
        soldUnits: 2,
        conversionRate: 7.1,
        taskCompletionRate: 62,
      },
      {
        id: 'rep-james',
        name: 'James Wilson',
        activeLeads: 18,
        tasksDue: 3,
        overdueTasks: 3,
        appointmentsToday: 1,
        callsMade: 22,
        textsSent: 26,
        emailsSent: 15,
        showRate: 64,
        soldUnits: 2,
        conversionRate: 11.1,
        taskCompletionRate: 88,
      },
    ],
    coachingInsights: [
      {
        id: 'coach-sarah',
        salespersonId: 'rep-sarah',
        salespersonName: 'Sarah Parker',
        type: 'warning',
        metricHighlight: 'Tasks: 94% · Calls: High · Contacted → Appt: 8%',
        insight: 'Activity is strong, but appointment conversion is below team average.',
        actionRecommendation:
          'Review phone recordings and coach on requesting the showroom visit before offering remote pricing.',
      },
      {
        id: 'coach-michael',
        salespersonId: 'rep-michael',
        salespersonName: 'Michael Brown',
        type: 'info',
        metricHighlight: '12 overdue tasks · 62% follow-up completion',
        insight: 'Activity backlog is significantly harming conversion velocity.',
        actionRecommendation:
          'Before focusing on closing percentage, address daily activity completion discipline.',
      },
    ],
    dateRange: range,
  };
}

function getMockOwnerWorkspace(range: DateRangePreset): OwnerWorkspaceData {
  return {
    dealershipName: 'Premier Automotive Group',
    totalActiveOpportunities: 184,
    appointmentsCount: 49,
    showsCount: 32,
    showRate: 65.3,
    workingDealsCount: 15,
    unitsSold: 23,
    overallConversionRate: 12.5,
    salesVolume: 1420000,
    financialsVisible: true,
    grossProfit: 118500,
    netProfit: 64200,
    managerComparisons: [
      {
        managerId: 'mgr-shane',
        managerName: 'Shane Miller',
        teamName: 'Downtown Team',
        pipelineCount: 112,
        appointmentsCount: 28,
        showsCount: 18,
        soldUnits: 11,
        conversionRate: 9.8,
        grossProfit: 62400,
        netProfit: 34100,
      },
      {
        managerId: 'mgr-marcus',
        managerName: 'Marcus Hayes',
        teamName: 'Westside Team',
        pipelineCount: 97,
        appointmentsCount: 24,
        showsCount: 17,
        soldUnits: 9,
        conversionRate: 9.2,
        grossProfit: 49100,
        netProfit: 27500,
      },
    ],
    pipelineFunnel: [
      {
        fromStage: 'New Lead',
        toStage: 'Contacted',
        conversionRate: 81,
        dropOffRate: 19,
        isHighestDropOff: false,
      },
      {
        fromStage: 'Contacted',
        toStage: 'Appointment Set',
        conversionRate: 42,
        dropOffRate: 58,
        isHighestDropOff: true, // Key drop-off bottleneck
      },
      {
        fromStage: 'Appointment Set',
        toStage: 'Show / Test Drive',
        conversionRate: 68,
        dropOffRate: 32,
        isHighestDropOff: false,
      },
      {
        fromStage: 'Show / Test Drive',
        toStage: 'Working Deal',
        conversionRate: 54,
        dropOffRate: 46,
        isHighestDropOff: false,
      },
      {
        fromStage: 'Working Deal',
        toStage: 'Sold',
        conversionRate: 47,
        dropOffRate: 53,
        isHighestDropOff: false,
      },
    ],
    lostReasons: [
      { reason: 'Purchased Elsewhere', count: 18, percentage: 34 },
      { reason: 'Price / Monthly Payment', count: 14, percentage: 26 },
      { reason: 'Financing Declined', count: 10, percentage: 18 },
      { reason: 'Vehicle Unavailable / Sold', count: 6, percentage: 12 },
      { reason: 'No Response / Unreachable', count: 5, percentage: 10 },
    ],
    dateRange: range,
  };
}
