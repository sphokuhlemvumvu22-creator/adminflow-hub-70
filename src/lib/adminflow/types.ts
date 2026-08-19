export type Role = "Administrator" | "Manager" | "Employee";

export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Overdue";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  department: string;
  dueDate: string; // ISO yyyy-mm-dd
  priority: TaskPriority;
  status: TaskStatus;
  attachment?: string;
}

export interface ActionItem {
  id: string;
  what: string;
  owner: string;
  dueDate: string;
  done: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
  agenda: string;
  notes: string;
  minutes: string;
  actionItems: ActionItem[];
  followUp?: string;
}

export type DocCategory =
  | "Contracts"
  | "Policies"
  | "Certificates"
  | "Licences"
  | "Employee documents"
  | "Supplier documents"
  | "Financial documents"
  | "Compliance documents";

export interface DocRecord {
  id: string;
  name: string;
  category: DocCategory;
  department: string;
  owner: string;
  created: string;
  expiry: string;
  status: "Active" | "Under review" | "Archived";
  notes: string;
  file?: string;
}

export interface Visitor {
  id: string;
  name: string;
  company: string;
  phone: string;
  host: string;
  purpose: string;
  arrival: string; // ISO datetime
  departure?: string;
  status: "Expected" | "On site" | "Checked out";
}

export type LeaveType =
  | "Annual leave"
  | "Sick leave"
  | "Family responsibility leave"
  | "Unpaid leave"
  | "Other";

export interface LeaveRequest {
  id: string;
  employee: string;
  department: string;
  type: LeaveType;
  start: string;
  end: string;
  reason: string;
  document?: string;
  status: "Pending" | "Approved" | "Rejected" | "Info requested";
  note?: string;
}

export interface Supply {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minimum: number;
  supplier: string;
  lastOrder: string;
  unit: string;
}

export interface Contact {
  id: string;
  name: string;
  kind: "Employee" | "Supplier" | "External";
  department: string;
  position: string;
  email: string;
  phone: string;
  extension?: string;
  location: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
}

export interface NotificationPrefs {
  meetings: boolean;
  overdueTasks: boolean;
  documents: boolean;
  leave: boolean;
  supplies: boolean;
  deadlines: boolean;
}
