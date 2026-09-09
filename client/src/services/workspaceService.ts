import api from './api';
import type {
  SalespersonWorkspaceData,
  ManagerWorkspaceData,
  OwnerWorkspaceData,
  DateRangePreset,
  TaskOutcome,
  LostReason,
} from '@crm/shared';

function workspaceData<T>(body: unknown): T {
  if (
    !body ||
    typeof body !== 'object' ||
    !('success' in body) ||
    body.success !== true ||
    !('data' in body) ||
    !body.data ||
    typeof body.data !== 'object' ||
    Array.isArray(body.data)
  ) {
    throw new Error(
      'The workspace API returned an invalid response. Please check the backend connection.'
    );
  }
  return body.data as T;
}

export async function fetchSalespersonWorkspace(): Promise<SalespersonWorkspaceData> {
  return workspaceData((await api.get('/workspace/salesperson')).data);
}
export async function fetchManagerWorkspace(
  range: DateRangePreset = 'mtd'
): Promise<ManagerWorkspaceData> {
  return workspaceData(
    (await api.get('/workspace/manager', { params: { range } })).data
  );
}
export async function fetchOwnerWorkspace(
  range: DateRangePreset = 'mtd'
): Promise<OwnerWorkspaceData> {
  return workspaceData(
    (await api.get('/workspace/owner', { params: { range } })).data
  );
}
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
  return (await api.post(`/workspace/tasks/${taskId}/complete`, payload)).data
    .data;
}
export async function markLeadSold(
  leadId: string,
  payload: {
    saleValue: number;
    vehicleId?: string;
    grossProfit?: number;
    netProfit?: number;
  }
) {
  return (await api.post(`/workspace/leads/${leadId}/sold`, payload)).data.data;
}
export async function markLeadLost(
  leadId: string,
  payload: { lostReason: LostReason }
) {
  return (await api.post(`/workspace/leads/${leadId}/lost`, payload)).data.data;
}
