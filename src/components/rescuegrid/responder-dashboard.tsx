import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Crosshair, MapPin, Navigation, Route, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRescueGridStore } from "@/lib/rescuegrid-store";
import type { AppView } from "@/lib/rescuegrid-types";
import { CommandScene } from "./command-scene";
import { IncidentCard } from "./incident-card";
import { IncidentDetail } from "./incident-detail";
import { StatusBadge } from "./status-badge";

export function ResponderDashboard({ view }: { view: AppView }) {
  const incidents = useRescueGridStore((state) => state.incidents);
  const selectedId = useRescueGridStore((state) => state.selectedIncidentId);
  const selectIncident = useRescueGridStore((state) => state.selectIncident);
  const [navigating, setNavigating] = useState(false);
  const assigned = incidents.filter((item) => item.assignedResponder === "Jordan Lee" || (item.status !== "Resolved" && item.assignedResponder));
  const selected = incidents.find((item) => item.id === selectedId) ?? assigned[0] ?? incidents[0];

  if (view === "history") return <HistoryView />;
  if (view === "overview") return <div className="relative h-[calc(100dvh-4rem)] overflow-hidden"><CommandScene /><div className="pointer-events-none absolute inset-0 bg-map-vignette" /><div className="pointer-events-auto absolute left-4 top-4 w-[min(23rem,calc(100%-2rem))] glass-panel rounded-lg p-4 md:left-6 md:top-6"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Live response map</p><h1 className="mt-2 font-display text-2xl font-bold">Campus tactical view</h1><p className="mt-2 text-xs text-muted-foreground">Select an active incident to view its assignment.</p><div className="mt-4 space-y-2">{assigned.slice(0, 3).map((incident) => <IncidentCard key={incident.id} incident={incident} selected={selected?.id === incident.id} onSelect={() => selectIncident(incident.id)} />)}</div></div></div>;
  if (!selected) return <EmptyState />;

  return <div className="mx-auto max-w-[1600px] p-4 md:p-6"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal">Field unit MED-2</p><h1 className="mt-2 font-display text-3xl font-bold">Responder console</h1><p className="mt-1 text-sm text-muted-foreground">Good morning, Jordan. {assigned.filter((item) => item.status !== "Resolved").length} active assignments.</p></div><div className="flex items-center gap-2 rounded-full border border-success/25 bg-success/5 px-3 py-2 text-xs text-success"><Signal className="size-4" />Unit online</div></div>
    <div className="grid min-h-[720px] gap-4 xl:grid-cols-[21rem_1fr_24rem]"><section className="glass-panel rounded-lg p-3"><div className="flex items-center justify-between px-1 pb-3"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned queue</p><span className="font-mono text-xs text-signal">{assigned.length}</span></div><div className="space-y-2">{assigned.map((incident) => <IncidentCard key={incident.id} incident={incident} selected={selected.id === incident.id} onSelect={() => selectIncident(incident.id)} />)}</div></section>
      <section className="relative min-h-96 overflow-hidden rounded-lg border border-border bg-panel"><CommandScene /><div className="pointer-events-none absolute inset-0 bg-map-vignette" /><div className="absolute left-4 top-4 rounded-md border border-border bg-background/80 px-3 py-2 backdrop-blur"><p className="font-mono text-[9px] uppercase text-muted-foreground">Route to incident</p><p className="mt-1 flex items-center gap-1.5 text-xs font-semibold"><MapPin className="size-3 text-alert" />{selected.location}</p></div><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-md border border-border bg-background/85 p-3 backdrop-blur-xl"><div><p className="font-mono text-[9px] uppercase text-muted-foreground">Fastest campus route</p><p className="mt-1 text-sm font-semibold">0.4 mi · 3 min</p></div><Button variant={navigating ? "outline" : "signal"} onClick={() => setNavigating((value) => !value)}>{navigating ? <Crosshair /> : <Navigation />}{navigating ? "Tracking" : "Navigate"}</Button></div>{navigating && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1.5 font-mono text-[10px] text-signal"><Route className="size-3" />ROUTE ACTIVE</motion.div>}</section>
      <IncidentDetail incident={selected} mode="responder" />
    </div></div>;
}

function HistoryView() { const incidents = useRescueGridStore((state) => state.incidents); return <div className="mx-auto max-w-5xl p-4 md:p-8"><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal">Field record</p><h1 className="mt-2 font-display text-3xl font-bold">Response history</h1><div className="mt-6 overflow-hidden rounded-lg border border-border bg-panel/70">{incidents.map((incident) => <div key={incident.id} className="grid gap-3 border-b border-border p-4 last:border-0 md:grid-cols-[1fr_auto_auto] md:items-center"><div><p className="font-semibold">{incident.title}</p><p className="mt-1 text-xs text-muted-foreground">{incident.id} · {incident.location}</p></div><StatusBadge status={incident.status} /><span className="font-mono text-xs text-muted-foreground">{incident.reportedAt}</span></div>)}</div></div>; }
function EmptyState() { return <div className="grid min-h-[calc(100dvh-4rem)] place-items-center p-6 text-center"><div><CheckCircle2 className="mx-auto size-12 text-success" /><h1 className="mt-4 font-display text-2xl font-bold">All clear</h1><p className="mt-2 text-sm text-muted-foreground">No active assignments. Stay ready.</p></div></div>; }