export interface ICallLog {
  id: string;
  dealership_id: string;
  customer_id: string;
  lead_id?: string;
  user_id: string;
  direction: 'inbound' | 'outbound';
  duration_seconds: number;
  result: 'answered' | 'no_answer' | 'voicemail' | 'callback_requested';
  notes?: string;
  created_at: string;
}
export type CallLog = ICallLog;
