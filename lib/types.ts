export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Supabase requires Relationships on each table to resolve query return types
export type Database = {
  public: {
    Tables: {
      settings: { Row: Settings; Insert: Partial<Settings>; Update: Partial<Settings>; Relationships: [] };
      clients: { Row: Client; Insert: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>; Update: Partial<Client>; Relationships: [] };
      projects: { Row: Project; Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>; Update: Partial<Project>; Relationships: [] };
      tasks: { Row: Task; Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>; Update: Partial<Task>; Relationships: [] };
      expenses: { Row: Expense; Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'user_id'>; Update: Partial<Expense>; Relationships: [] };
      documents: { Row: Document; Insert: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'user_id'>; Update: Partial<Document>; Relationships: [] };
      weekly_focus: { Row: WeeklyFocus; Insert: Omit<WeeklyFocus, 'id' | 'created_at' | 'user_id'>; Update: Partial<WeeklyFocus>; Relationships: [] };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Settings = {
  user_id: string;
  company_name: string;
  company_tagline: string;
  company_email: string;
  company_phone: string;
  company_website: string;
  company_address: string;
  currency_symbol: string;
  tax_rate: number;
  invoice_prefix: string;
  quote_prefix: string;
  payment_terms: string;
  bank_details: string;
  invoice_counter: number;
  quote_counter: number;
  content_pillars: string[];
  brand_voice: string;
  default_hashtags: string[];
  default_model_fast: string;
  default_model_smart: string;
  default_model_local: string;
  updated_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingType = 'one-time' | 'retainer-monthly' | 'hybrid';
export type ProjectStage = 'Lead' | 'Discovery' | 'Build' | 'Launch' | 'Maintenance';
export type ProjectType = 'Website' | 'Bot' | 'AI Integration' | 'Other';
export type RetainerStatus = 'active' | 'paused' | 'ended';

export type Project = {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  type: ProjectType;
  stage: ProjectStage;
  description: string | null;
  billing_type: BillingType;
  value: number;
  one_time_value: number;
  retainer_start: string | null;
  retainer_end: string | null;
  retainer_status: RetainerStatus;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string } | null;
};

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type PriorityLevel = 'Low' | 'Medium' | 'High';

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: string | null;
  notes: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  projects?: { name: string; client_id: string; clients?: { name: string } | null } | null;
};

export type ExpenseKind = 'one-time' | 'subscription';
export type ExpenseFreq = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type Expense = {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  category: string;
  kind: ExpenseKind;
  amount: number;
  frequency: ExpenseFreq | null;
  start_date: string | null;
  end_date: string | null;
  expense_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DocKind = 'quotation' | 'invoice';
export type DocStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Paid' | 'Overdue';

export type LineItem = {
  description: string;
  quantity: number;
  rate: number;
};

export type Document = {
  id: string;
  user_id: string;
  client_id: string;
  project_id: string | null;
  kind: DocKind;
  number: string;
  date: string;
  due_date: string | null;
  status: DocStatus;
  items: LineItem[];
  tax_rate: number;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string } | null;
  projects?: { name: string } | null;
};

export type WeeklyFocus = {
  id: string;
  user_id: string;
  text: string;
  done: boolean;
  position: number;
  created_at: string;
};

export const STAGES: ProjectStage[] = ['Lead', 'Discovery', 'Build', 'Launch', 'Maintenance'];
export const TASK_STATUSES: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];
export const PRIORITIES: PriorityLevel[] = ['Low', 'Medium', 'High'];
export const PROJECT_TYPES: ProjectType[] = ['Website', 'Bot', 'AI Integration', 'Other'];
export const EXPENSE_CATEGORIES = [
  'Software / SaaS', 'AI / API Credits', 'Hosting & Domains', 'Marketing',
  'Equipment', 'Contractors', 'Salaries', 'Office & Utilities', 'Travel', 'Taxes', 'Other',
];
export const EXPENSE_FREQUENCIES: { key: ExpenseFreq; label: string; perYear: number }[] = [
  { key: 'monthly', label: 'Monthly', perYear: 12 },
  { key: 'yearly', label: 'Yearly', perYear: 1 },
  { key: 'quarterly', label: 'Quarterly', perYear: 4 },
  { key: 'weekly', label: 'Weekly', perYear: 52 },
];
