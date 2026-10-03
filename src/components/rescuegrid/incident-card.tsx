import { ArrowUpRight, MapPin } from "lucide-react";
import type { Incident } from "@/lib/rescuegrid-types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

export function IncidentCard({ incident, selected, onSelect }: { incident: Incident; selected?: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={cn("group w-full rounded-md border p-3 text-left transition-all duration-300", selected ? "border-signal/50 bg-signal/8 shadow-signal" : "border-border/70 bg-panel/70 hover:border-signal/30 hover:bg-panel-elevated/80")}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><StatusBadge status={incident.priority} pulse={incident.priority === "Critical"} /><span className="font-mono text-[10px] text-muted-foreground">{incident.id}</span></div>
        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" />
      </div>
      <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{incident.title}</h3>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="flex min-w-0 items-center gap-1"><MapPin className="size-3 shrink-0" /><span className="truncate">{incident.location}</span></span><span className="font-mono text-foreground">{incident.elapsed}</span></div>
    </button>
  );
}