import type { Incident, Responder } from "./rescuegrid-types";

export const demoIncidents: Incident[] = [
  {
    id: "RG-2481", title: "Student collapsed near library", category: "Medical", status: "On scene", priority: "Critical",
    location: "Avery Library · North entrance", coordinates: [-1.9, 0.8], reportedAt: "05:31", elapsed: "08:42",
    description: "Student is conscious but disoriented. Bystanders have cleared the entrance.", reporter: "Maya Chen",
    assignedResponder: "Jordan Lee", backupRequested: false,
    timeline: [
      { id: "t1", status: "Reported", time: "05:31", actor: "Maya Chen" },
      { id: "t2", status: "Assigned", time: "05:32", actor: "Dispatch AI", note: "Unit MED-2 assigned" },
      { id: "t3", status: "En route", time: "05:33", actor: "Jordan Lee" },
      { id: "t4", status: "On scene", time: "05:37", actor: "Jordan Lee", note: "Patient assessment underway" },
    ],
  },
  {
    id: "RG-2482", title: "Smoke detected in science wing", category: "Fire", status: "En route", priority: "Critical",
    location: "Newton Hall · Lab 214", coordinates: [1.3, -0.4], reportedAt: "05:35", elapsed: "04:16",
    description: "Visible smoke from an equipment cabinet. Alarm activated; floor evacuation in progress.", reporter: "Lab Safety Sensor",
    assignedResponder: "Priya Shah", backupRequested: true,
    timeline: [
      { id: "t5", status: "Reported", time: "05:35", actor: "Safety network" },
      { id: "t6", status: "Assigned", time: "05:35", actor: "Alex Morgan", note: "FIRE-1 dispatched" },
      { id: "t7", status: "En route", time: "05:36", actor: "Priya Shah" },
    ],
  },
  {
    id: "RG-2479", title: "Suspicious person report", category: "Security", status: "Assigned", priority: "High",
    location: "East Residence · Courtyard", coordinates: [2.1, 1.5], reportedAt: "05:27", elapsed: "12:08",
    description: "Unknown person repeatedly checking secured doors near the east courtyard.", reporter: "Anonymous student",
    assignedResponder: "Marcus Cole", backupRequested: false,
    timeline: [
      { id: "t8", status: "Reported", time: "05:27", actor: "Anonymous" },
      { id: "t9", status: "Assigned", time: "05:29", actor: "Alex Morgan", note: "PATROL-4 assigned" },
    ],
  },
  {
    id: "RG-2476", title: "Water leak on lower level", category: "Hazard", status: "Resolved", priority: "Medium",
    location: "Student Union · B1 corridor", coordinates: [-0.2, -1.7], reportedAt: "04:48", elapsed: "22:14",
    description: "Standing water near electrical service closet. Area isolated and facilities notified.", reporter: "Noah Williams",
    assignedResponder: "Elena Torres", backupRequested: false,
    timeline: [
      { id: "t10", status: "Reported", time: "04:48", actor: "Noah Williams" },
      { id: "t11", status: "Assigned", time: "04:50", actor: "Dispatch AI" },
      { id: "t12", status: "En route", time: "04:52", actor: "Elena Torres" },
      { id: "t13", status: "On scene", time: "04:57", actor: "Elena Torres" },
      { id: "t14", status: "Resolved", time: "05:10", actor: "Elena Torres", note: "Area secured" },
    ],
  },
];

export const demoResponders: Responder[] = [
  { id: "r1", name: "Jordan Lee", initials: "JL", unit: "MED-2", specialty: "EMT", status: "On scene", eta: "Arrived" },
  { id: "r2", name: "Priya Shah", initials: "PS", unit: "FIRE-1", specialty: "Fire & Hazmat", status: "Responding", eta: "2 min" },
  { id: "r3", name: "Marcus Cole", initials: "MC", unit: "PATROL-4", specialty: "Campus Safety", status: "Responding", eta: "4 min" },
  { id: "r4", name: "Elena Torres", initials: "ET", unit: "MED-1", specialty: "Paramedic", status: "Available", eta: "—" },
  { id: "r5", name: "Sam Okafor", initials: "SO", unit: "PATROL-2", specialty: "Campus Safety", status: "Available", eta: "—" },
];

export const campusLocations = ["Current GPS location", "Avery Library", "Newton Hall", "East Residence", "Student Union", "Athletics Center"];