// Supabase Relational Database TypeScript Definitions

export type PlatformRole = 'user' | 'super_admin';
export type DealershipRole = 'owner' | 'manager' | 'salesperson';
export type LeadPriority = 'low' | 'medium' | 'high';
export type LeadTemperature = 'cold' | 'warm' | 'hot';
export type LeadStatus = 'open' | 'won' | 'lost' | 'archived';
export type TaskStatus = 'pending' | 'completed' | 'cancelled';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type MessageChannel = 'sms' | 'email' | 'internal';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'draft' | 'scheduled' | 'queued' | 'sent' | 'delivered' | 'received' | 'failed';
export type AutomationStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Profile {
  id: string; // UUID (matches auth.users.id)
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  platform_role: PlatformRole;
  status: 'active' | 'invited' | 'suspended';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dealership {
  id: string; // UUID
  name: string;
  slug: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  website?: string;
  timezone: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DealershipMembership {
  id: string;
  dealership_id: string;
  user_id: string;
  role: DealershipRole;
  permissions: string[];
  status: 'active' | 'invited' | 'inactive';
  created_at: string;
  updated_at: string;

  // Joined fields
  dealership?: Dealership;
  profile?: Profile;
}

export interface LeadSource {
  id: string;
  dealership_id: string;
  name: string;
  channel: string;
  is_active: boolean;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  dealership_id: string;
  name: string;
  slug: string;
  color: string;
  sort_order: number;
  type: 'standard' | 'won' | 'lost';
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  dealership_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  location?: string;
  preferred_contact_method?: 'sms' | 'email' | 'phone';
  assigned_user_id?: string;
  tags?: string[];
  sms_consent: boolean;
  email_consent: boolean;
  phone_consent: boolean;
  do_not_contact: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  assigned_user?: Profile;
}

export interface Vehicle {
  id: string;
  dealership_id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin: string;
  stock_number: string;
  mileage: number;
  price: number;
  exterior_color?: string;
  interior_color?: string;
  transmission?: string;
  fuel_type?: string;
  description?: string;
  status: 'available' | 'pending' | 'sold' | 'archived';
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleImage {
  id: string;
  dealership_id: string;
  vehicle_id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  uploaded_by?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  dealership_id: string;
  customer_id: string;
  vehicle_id?: string;
  assigned_user_id?: string;
  source_id?: string;
  pipeline_stage_id: string;
  priority: LeadPriority;
  temperature: LeadTemperature;
  status: LeadStatus;
  estimated_value?: number;
  notes?: string;
  last_contact_at?: string;
  next_follow_up_at?: string;
  lost_reason?: string;
  sold_at?: string;
  sold_value?: number;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;

  // Joined relation fields
  customer?: Customer;
  vehicle?: Vehicle;
  assigned_user?: Profile;
  stage?: PipelineStage;
  source?: LeadSource;
}

export interface Conversation {
  id: string;
  dealership_id: string;
  customer_id: string;
  lead_id?: string;
  assigned_user_id?: string;
  status: 'open' | 'closed' | 'archived';
  last_message_at?: string;
  last_message_preview?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  dealership_id: string;
  conversation_id: string;
  lead_id?: string;
  customer_id: string;
  sender_user_id?: string;
  channel: MessageChannel;
  direction: MessageDirection;
  status: MessageStatus;
  subject?: string;
  content: string;
  provider?: string;
  provider_message_id?: string;
  from_address?: string;
  to_addresses?: string[];
  from_number?: string;
  to_number?: string;
  attachments?: any[];
  read_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Joined fields
  sender?: Profile;
}

export interface Activity {
  id: string;
  dealership_id: string;
  lead_id?: string;
  customer_id?: string;
  user_id?: string;
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;

  user?: Profile;
}

export interface Task {
  id: string;
  dealership_id: string;
  lead_id?: string;
  customer_id?: string;
  assigned_user_id?: string;
  created_by_user_id?: string;
  type: string;
  title: string;
  description?: string;
  priority: LeadPriority;
  due_at: string;
  status: TaskStatus;
  completed_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;

  assigned_user?: Profile;
}

export interface Appointment {
  id: string;
  dealership_id: string;
  lead_id?: string;
  customer_id?: string;
  vehicle_id?: string;
  assigned_user_id?: string;
  type: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location?: string;
  notes?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;

  customer?: Customer;
  vehicle?: Vehicle;
  assigned_user?: Profile;
}

export interface Automation {
  id: string;
  dealership_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config?: Record<string, any>;
  status: AutomationStatus;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;

  steps?: AutomationStep[];
}

export interface AutomationStep {
  id: string;
  automation_id: string;
  dealership_id: string;
  step_order: number;
  type: 'delay' | 'condition' | 'sms' | 'email' | 'task' | 'stage_change' | 'assign' | 'notification' | 'ai_action';
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  dealership_id: string;
  name: string;
  channel: 'sms' | 'email';
  subject?: string;
  body: string;
  category?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  dealership_id?: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
