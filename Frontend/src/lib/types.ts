export type Role = "resident" | "admin";

export type ComplaintCategory =
  | "Plumbing"
  | "Electrical"
  | "Housekeeping"
  | "Security"
  | "Elevator"
  | "Common Area"
  | "Other";

export const CATEGORIES: ComplaintCategory[] = [
  "Plumbing",
  "Electrical",
  "Housekeeping",
  "Security",
  "Elevator",
  "Common Area",
  "Other",
];

export type ComplaintStatus = "Open" | "In Progress" | "Resolved";
export const STATUSES: ComplaintStatus[] = ["Open", "In Progress", "Resolved"];

export type Priority = "Low" | "Medium" | "High";
export const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // mock only — plaintext in localStorage; NEVER do this with a real backend
  flat: string;
  phone: string;
  role: Role;
};

export type HistoryEntry = {
  at: string; // ISO date
  actorName: string;
  action: string; // e.g. "Complaint raised", "Status → In Progress", "Priority set to High"
  note?: string;
};

export type Complaint = {
  id: string;
  residentId: string;
  residentName: string;
  residentFlat: string;
  category: ComplaintCategory;
  description: string;
  photo: string | null; // data URL
  status: ComplaintStatus;
  priority: Priority;
  manualOverdue: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  history: HistoryEntry[];
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  important: boolean;
  authorName: string;
  createdAt: string;
};

export type Settings = {
  overdueDays: number;
};
