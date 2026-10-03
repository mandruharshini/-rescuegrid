export type Role = "student" | "responder" | "admin";
export type IncidentCategory = "Medical" | "Fire" | "Security" | "Hazard";
export type IncidentStatus = "Reported" | "Assigned" | "En route" | "On scene" | "Resolved";
export type Priority = "Critical" | "High" | "Medium";

export interface TimelineEvent {
  id: string;
  status: IncidentStatus;
  time: string;
  actor: string;
  note?: string;
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  status: IncidentStatus;
  priority: Priority;
  location: string;
  coordinates: [number, number];
  reportedAt: string;
  elapsed: string;
  description: string;
  reporter: string;
  assignedResponder?: string;
  backupRequested: boolean;
  timeline: TimelineEvent[];
}

export interface Responder {
  id: string;
  name: string;
  initials: string;
  unit: string;
  specialty: string;
  status: "Available" | "Responding" | "On scene" | "Offline";
  eta?: string;
}

export type AppView = "overview" | "report" | "assignments" | "analytics" | "history";