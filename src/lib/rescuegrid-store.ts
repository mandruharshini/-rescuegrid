import { create } from "zustand";
import { demoIncidents } from "./rescuegrid-data";
import type { AppView, Incident, IncidentCategory, IncidentStatus, Role } from "./rescuegrid-types";

interface NewIncident {
  category: IncidentCategory;
  location: string;
  description: string;
  hasPhoto: boolean;
}

interface RescueGridState {
  role: Role;
  view: AppView;
  incidents: Incident[];
  selectedIncidentId: string;
  notificationCount: number;
  setRole: (role: Role) => void;
  setView: (view: AppView) => void;
  selectIncident: (id: string) => void;
  createIncident: (incident: NewIncident) => string;
  updateStatus: (id: string, status: IncidentStatus) => void;
  requestBackup: (id: string) => void;
  assignResponder: (id: string, responder: string) => void;
  clearNotifications: () => void;
}

export const useRescueGridStore = create<RescueGridState>((set) => ({
  role: "admin",
  view: "overview",
  incidents: demoIncidents,
  selectedIncidentId: demoIncidents[0]?.id ?? "",
  notificationCount: 3,
  setRole: (role) => set({ role, view: role === "student" ? "report" : role === "responder" ? "assignments" : "overview" }),
  setView: (view) => set({ view }),
  selectIncident: (selectedIncidentId) => set({ selectedIncidentId }),
  createIncident: (input) => {
    const id = `RG-${2490 + Math.floor(Date.now() % 100)}`;
    const created: Incident = {
      id, title: `${input.category} assistance requested`, category: input.category, status: "Reported", priority: input.category === "Medical" || input.category === "Fire" ? "Critical" : "High",
      location: input.location, coordinates: [0.4, 1.1], reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), elapsed: "00:01",
      description: input.description || "No additional details provided.", reporter: "You", backupRequested: false,
      timeline: [{ id: `${id}-reported`, status: "Reported", time: "Just now", actor: "You", ...(input.hasPhoto ? { note: "Photo attached" } : {}) }],
    };
    set((state) => ({ incidents: [created, ...state.incidents], selectedIncidentId: id, notificationCount: state.notificationCount + 1 }));
    return id;
  },
  updateStatus: (id, status) => set((state) => ({ incidents: state.incidents.map((incident) => incident.id === id ? { ...incident, status, timeline: [...incident.timeline, { id: `${id}-${status}-${incident.timeline.length}`, status, time: "Just now", actor: "You" }] } : incident) })),
  requestBackup: (id) => set((state) => ({ incidents: state.incidents.map((incident) => incident.id === id ? { ...incident, backupRequested: true } : incident), notificationCount: state.notificationCount + 1 })),
  assignResponder: (id, assignedResponder) => set((state) => ({ incidents: state.incidents.map((incident) => incident.id === id ? { ...incident, assignedResponder, status: incident.status === "Reported" ? "Assigned" : incident.status } : incident) })),
  clearNotifications: () => set({ notificationCount: 0 }),
}));