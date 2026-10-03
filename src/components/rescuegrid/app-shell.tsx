import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Activity, BarChart3, Bell, ChevronDown, ClipboardList, History, LayoutDashboard, Menu, Radio, Shield, Siren, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRescueGridStore } from "@/lib/rescuegrid-store";
import type { AppView, Role } from "@/lib/rescuegrid-types";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "./admin-dashboard";
import { ResponderDashboard } from "./responder-dashboard";
import { StudentDashboard } from "./student-dashboard";

const roleLabels: Record<Role, string> = { student: "Student", responder: "Responder", admin: "Command Admin" };
const roleIcons = { student: UserRound, responder: Shield, admin: Radio };

export function AppShell() {
  const role = useRescueGridStore((state) => state.role);
  const view = useRescueGridStore((state) => state.view);
  const setRole = useRescueGridStore((state) => state.setRole);
  const setView = useRescueGridStore((state) => state.setView);
  const notificationCount = useRescueGridStore((state) => state.notificationCount);
  const clearNotifications = useRescueGridStore((state) => state.clearNotifications);
  const [roleMenu, setRoleMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const RoleIcon = roleIcons[role];
  const navItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = role === "student"
    ? [{ id: "report", label: "Report", icon: Siren }, { id: "history", label: "My reports", icon: History }]
    : role === "responder"
      ? [{ id: "assignments", label: "Assignments", icon: ClipboardList }, { id: "overview", label: "Live map", icon: Radio }, { id: "history", label: "History", icon: History }]
      : [{ id: "overview", label: "Command", icon: LayoutDashboard }, { id: "analytics", label: "Analytics", icon: BarChart3 }, { id: "history", label: "History", icon: History }];

  return (
    <TooltipProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <button onClick={() => setMobileNav(true)} aria-label="Open navigation" className="mr-3 grid size-9 place-items-center rounded-md border border-border bg-panel lg:hidden"><Menu className="size-4" /></button>
          <div className="flex items-center gap-3">
            <div className="relative grid size-9 place-items-center rounded-md border border-alert/40 bg-alert/10 shadow-alert"><Activity className="size-5 text-alert" /><span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-alert animate-pulse" /></div>
            <div><div className="font-display text-base font-bold tracking-wide">RESCUE<span className="text-alert">GRID</span></div><div className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground sm:block">Campus response network</div></div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-success/25 bg-success/5 px-3 py-1.5 font-mono text-[10px] uppercase text-success md:flex"><span className="size-1.5 rounded-full bg-success animate-pulse" />All systems online</div>
            <div className="relative">
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => { setNotifications((open) => !open); clearNotifications(); }} className="relative"><Bell />{notificationCount > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-alert text-[9px] font-bold text-alert-foreground">{notificationCount}</span>}</Button></TooltipTrigger><TooltipContent>Notifications</TooltipContent></Tooltip>
              <AnimatePresence>{notifications && <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-border bg-panel-elevated p-3 shadow-command"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent signals</p>{["Backup requested · Newton Hall", "Unit MED-2 arrived on scene", "New incident priority escalated"].map((item, index) => <div key={item} className="flex gap-3 border-t border-border/60 py-3 first:border-0"><span className={cn("mt-1 size-2 shrink-0 rounded-full", index === 0 ? "bg-alert" : "bg-signal")} /><div><p className="text-sm">{item}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{index + 2} min ago</p></div></div>)}</motion.div>}</AnimatePresence>
            </div>
            <div className="relative">
              <button onClick={() => setRoleMenu((open) => !open)} className="flex h-10 items-center gap-2 rounded-md border border-border bg-panel px-2.5 text-left transition-colors hover:border-signal/40"><div className="grid size-7 place-items-center rounded bg-signal/10 text-signal"><RoleIcon className="size-4" /></div><div className="hidden sm:block"><p className="text-xs font-semibold">{roleLabels[role]}</p><p className="font-mono text-[9px] text-muted-foreground">Demo access</p></div><ChevronDown className="size-3 text-muted-foreground" /></button>
              <AnimatePresence>{roleMenu && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-12 w-48 rounded-md border border-border bg-panel-elevated p-1.5 shadow-command">{(Object.keys(roleLabels) as Role[]).map((item) => { const Icon = roleIcons[item]; return <button key={item} onClick={() => { setRole(item); setRoleMenu(false); }} className={cn("flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-accent", role === item && "bg-signal/10 text-signal")}><Icon className="size-4" />{roleLabels[item]}</button>; })}</motion.div>}</AnimatePresence>
            </div>
          </div>
        </header>

        <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-20 flex-col items-center border-r border-border/70 bg-background/75 py-5 backdrop-blur-xl lg:flex">
          <nav className="flex flex-col gap-3">{navItems.map((item) => <Tooltip key={item.id}><TooltipTrigger asChild><button onClick={() => setView(item.id)} className={cn("relative grid size-11 place-items-center rounded-md border transition-all", view === item.id ? "border-signal/40 bg-signal/10 text-signal shadow-signal" : "border-transparent text-muted-foreground hover:border-border hover:bg-panel hover:text-foreground")}><item.icon className="size-5" />{view === item.id && <span className="absolute -left-5 h-6 w-0.5 rounded-full bg-signal" />}</button></TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip>)}</nav>
          <div className="mt-auto font-mono text-[9px] uppercase [writing-mode:vertical-rl] tracking-[0.25em] text-muted-foreground">Sector 01 · Connected</div>
        </aside>

        <AnimatePresence>{mobileNav && <><motion.button aria-label="Close navigation" className="fixed inset-0 z-[60] bg-scrim/70 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} /><motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28 }} className="fixed bottom-0 left-0 top-0 z-[70] w-72 border-r border-border bg-background p-5 lg:hidden"><div className="mb-10 flex items-center justify-between"><span className="font-display font-bold">RESCUE<span className="text-alert">GRID</span></span><Button variant="ghost" size="icon" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X /></Button></div><nav className="space-y-2">{navItems.map((item) => <button key={item.id} onClick={() => { setView(item.id); setMobileNav(false); }} className={cn("flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm", view === item.id ? "bg-signal/10 text-signal" : "text-muted-foreground")}><item.icon className="size-5" />{item.label}</button>)}</nav></motion.aside></>}</AnimatePresence>

        <main className="min-h-dvh pt-16 lg:pl-20">
          <AnimatePresence mode="wait"><motion.div key={`${role}-${view}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            {role === "student" ? <StudentDashboard view={view} /> : role === "responder" ? <ResponderDashboard view={view} /> : <AdminDashboard view={view} />}
          </motion.div></AnimatePresence>
        </main>
      </div>
    </TooltipProvider>
  );
}