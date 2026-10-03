import { Check, ChevronRight, Clock3, MapPin, Navigation, Radio, ShieldPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRescueGridStore } from "@/lib/rescuegrid-store";
import type { Incident, IncidentStatus } from "@/lib/rescuegrid-types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

const statusOrder: IncidentStatus[] = ["Reported", "Assigned", "En route", "On scene", "Resolved"];

export function IncidentDetail({ incident, mode }: { incident: Incident; mode: "responder" | "admin" }) {
  const updateStatus = useRescueGridStore((state) => state.updateStatus);
  const requestBackup = useRescueGridStore((state) => state.requestBackup);
  const currentIndex = statusOrder.indexOf(incident.status);
  const next = statusOrder[currentIndex + 1];
  return <section className="glass-panel flex min-h-0 flex-col rounded-lg">
    <div className="border-b border-border/70 p-4 md:p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={incident.priority} pulse /><StatusBadge status={incident.status} /><span className="font-mono text-[10px] text-muted-foreground">{incident.id}</span></div><h2 className="mt-3 font-display text-xl font-bold">{incident.title}</h2><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3 text-signal" />{incident.location}</p></div><div className="text-right"><p className="font-mono text-xl text-foreground">{incident.elapsed}</p><p className="font-mono text-[9px] uppercase text-muted-foreground">elapsed</p></div></div></div>
    <div className="min-h-0 flex-1 overflow-auto p-4 md:p-5"><p className="text-sm leading-6 text-muted-foreground">{incident.description}</p><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-md border border-border bg-background/35 p-3"><p className="flex items-center gap-1.5 font-mono text-[9px] uppercase text-muted-foreground"><UserRound className="size-3" />Reporter</p><p className="mt-1 text-xs font-semibold">{incident.reporter}</p></div><div className="rounded-md border border-border bg-background/35 p-3"><p className="flex items-center gap-1.5 font-mono text-[9px] uppercase text-muted-foreground"><Radio className="size-3" />Assigned</p><p className="mt-1 text-xs font-semibold">{incident.assignedResponder ?? "Awaiting assignment"}</p></div></div>
      <div className="mt-6"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Response timeline</p><div className="space-y-0">{incident.timeline.map((event, index) => <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">{index < incident.timeline.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-signal/25" />}<span className="relative mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-signal/40 bg-signal/10 text-signal"><Check className="size-2.5" /></span><div className="flex-1"><div className="flex items-center justify-between"><p className="text-xs font-semibold">{event.status}</p><span className="font-mono text-[9px] text-muted-foreground">{event.time}</span></div><p className="mt-0.5 text-[11px] text-muted-foreground">{event.actor}{event.note ? ` · ${event.note}` : ""}</p></div></div>)}</div></div>
    </div>
    <div className="grid gap-2 border-t border-border/70 p-4 sm:grid-cols-2">{mode === "responder" && <Button variant="outline" onClick={() => requestBackup(incident.id)} disabled={incident.backupRequested}><ShieldPlus />{incident.backupRequested ? "Backup requested" : "Request backup"}</Button>}<Button variant={next === "Resolved" ? "default" : "signal"} onClick={() => next && updateStatus(incident.id, next)} disabled={!next} className={mode === "admin" ? "sm:col-span-2" : ""}>{next ? <>{next === "En route" ? <Navigation /> : next === "Resolved" ? <Check /> : <ChevronRight />}{next === "En route" ? "Start navigation" : `Mark ${next}`}</> : <><Check />Incident resolved</>}</Button></div>
  </section>;
}