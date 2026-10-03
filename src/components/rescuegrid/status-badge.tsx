import { cn } from "@/lib/utils";
import type { IncidentStatus, Priority } from "@/lib/rescuegrid-types";

export function StatusBadge({ status, pulse = false }: { status: IncidentStatus | Priority; pulse?: boolean }) {
  const urgent = status === "Critical" || status === "Reported";
  const active = status === "En route" || status === "On scene" || status === "Assigned" || status === "High";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide", urgent ? "border-alert/35 bg-alert/10 text-alert" : active ? "border-signal/30 bg-signal/10 text-signal" : "border-success/30 bg-success/10 text-success")}>
      <span className={cn("size-1.5 rounded-full bg-current", pulse && "animate-pulse")} />{status}
    </span>
  );
}