import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, Check, ChevronRight, Cross, Flame, LocateFixed, MapPin, ShieldAlert, Siren, TriangleAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { campusLocations } from "@/lib/rescuegrid-data";
import { useRescueGridStore } from "@/lib/rescuegrid-store";
import type { AppView, IncidentCategory } from "@/lib/rescuegrid-types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

const categories = [
  { name: "Medical" as const, icon: Cross, hint: "Injury or illness" }, { name: "Fire" as const, icon: Flame, hint: "Smoke or flames" },
  { name: "Security" as const, icon: ShieldAlert, hint: "Threat or suspicious activity" }, { name: "Hazard" as const, icon: TriangleAlert, hint: "Unsafe campus condition" },
];

export function StudentDashboard({ view }: { view: AppView }) {
  const incidents = useRescueGridStore((state) => state.incidents);
  const createIncident = useRescueGridStore((state) => state.createIncident);
  const selectIncident = useRescueGridStore((state) => state.selectIncident);
  const [category, setCategory] = useState<IncidentCategory>("Medical");
  const [location, setLocation] = useState("Current GPS location");
  const [description, setDescription] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Campus GPS ready");
  const [photo, setPhoto] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const myReports = incidents.filter((item) => item.reporter === "You" || item.reporter === "Maya Chen");

  if (view === "history") return <div className="mx-auto max-w-5xl p-4 md:p-8"><PageHeading eyebrow="Student safety" title="My emergency reports" copy="Track updates from campus responders in real time." /><div className="mt-6 grid gap-3">{myReports.map((incident) => <button key={incident.id} onClick={() => selectIncident(incident.id)} className="glass-panel flex flex-col gap-3 rounded-md p-4 text-left sm:flex-row sm:items-center"><div className="grid size-11 place-items-center rounded-md bg-alert/10 text-alert"><Siren /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-semibold">{incident.title}</p><StatusBadge status={incident.status} /></div><p className="mt-1 text-xs text-muted-foreground">{incident.location} · {incident.reportedAt}</p></div><ChevronRight className="size-4 text-muted-foreground" /></button>)}</div></div>;

  const locate = () => {
    setLocating(true); setLocationStatus("Acquiring precise location…");
    if (!navigator.geolocation) { setTimeout(() => { setLocating(false); setLocationStatus("Demo location · Avery Library"); setLocation("Avery Library"); }, 700); return; }
    navigator.geolocation.getCurrentPosition(() => { setLocating(false); setLocationStatus("GPS locked · ±8 m"); }, () => { setLocating(false); setLocationStatus("Demo location · Avery Library"); setLocation("Avery Library"); }, { timeout: 2500 });
  };
  const submit = () => { const id = createIncident({ category, location, description, hasPhoto: Boolean(photo) }); setSubmittedId(id); };

  if (submittedId) return <div className="grid min-h-[calc(100dvh-4rem)] place-items-center p-4"><motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel w-full max-w-xl rounded-lg p-7 text-center shadow-command"><div className="mx-auto grid size-20 place-items-center rounded-full border border-success/40 bg-success/10 text-success shadow-success"><Check className="size-9" /></div><p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-success">Report transmitted</p><h1 className="mt-2 font-display text-3xl font-bold">Help is being dispatched</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Campus response has your location. Stay nearby if safe and keep your phone available.</p><div className="mx-auto mt-6 grid max-w-sm grid-cols-3 divide-x divide-border rounded-md border border-border bg-panel/70 py-3"><div><p className="font-mono text-xs text-muted-foreground">REPORT</p><p className="mt-1 text-sm font-semibold">{submittedId}</p></div><div><p className="font-mono text-xs text-muted-foreground">STATUS</p><p className="mt-1 text-sm font-semibold text-signal">RECEIVED</p></div><div><p className="font-mono text-xs text-muted-foreground">ETA</p><p className="mt-1 text-sm font-semibold">3–5 min</p></div></div><Button className="mt-7 w-full" onClick={() => setSubmittedId(null)}>Create another report</Button></motion.div></div>;

  return <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden"><div className="command-grid absolute inset-0 opacity-60" /><div className="relative mx-auto max-w-6xl p-4 md:p-8"><PageHeading eyebrow="Emergency report" title="What’s happening?" copy="Choose the situation. We’ll attach your location and alert the right campus team." /><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
    <section className="glass-panel rounded-lg p-4 md:p-6"><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{categories.map((item) => <button key={item.name} onClick={() => setCategory(item.name)} className={cn("group flex min-h-28 flex-col items-start justify-between rounded-md border p-3 text-left transition-all", category === item.name ? "border-alert/55 bg-alert/10 shadow-alert" : "border-border bg-panel/60 hover:border-signal/35")}><item.icon className={cn("size-6", category === item.name ? "text-alert" : "text-muted-foreground group-hover:text-signal")} /><div><p className="text-sm font-semibold">{item.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.hint}</p></div></button>)}</div>
    <div className="mt-6"><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</label><div className="mt-2 flex gap-2"><div className="relative flex-1"><MapPin className="absolute left-3 top-3 size-4 text-signal" /><select value={location} onChange={(event) => setLocation(event.target.value)} className="h-10 w-full appearance-none rounded-md border border-input bg-panel pl-10 pr-4 text-sm outline-none focus:border-signal">{campusLocations.map((item) => <option key={item}>{item}</option>)}</select></div><Button variant="outline" size="icon" onClick={locate} aria-label="Use precise GPS location"><LocateFixed className={cn(locating && "animate-spin")} /></Button></div><p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-success"><span className="size-1.5 rounded-full bg-success" />{locationStatus}</p></div>
    <div className="mt-5"><label htmlFor="details" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details <span className="font-normal normal-case">(optional)</span></label><Textarea id="details" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should responders know?" className="mt-2 min-h-28 bg-panel/60" /></div>
    <div className="mt-5 flex items-center gap-3"><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPhoto(file.name); }} /><Button variant="outline" onClick={() => inputRef.current?.click()}><Camera />Add photo</Button>{photo && <span className="flex min-w-0 items-center gap-1 text-xs text-success"><Upload className="size-3" /><span className="truncate">{photo}</span></span>}</div>
    <Button size="lg" onClick={submit} className="mt-6 h-14 w-full bg-alert text-base text-alert-foreground shadow-alert hover:bg-alert/90"><Siren className="size-5" />Send emergency report</Button></section>
    <aside className="relative min-h-72 overflow-hidden rounded-lg border border-border bg-panel"><div className="command-grid absolute inset-0" /><div className="absolute inset-0 bg-radial-signal" /><div className="relative flex h-full flex-col justify-between p-5"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Live location lock</span><span className="rounded-full border border-success/30 bg-success/10 px-2 py-1 font-mono text-[9px] text-success">SECURE</span></div><div className="relative mx-auto grid size-40 place-items-center"><span className="absolute inset-0 rounded-full border border-signal/15 animate-ping" /><span className="absolute inset-7 rounded-full border border-signal/25" /><div className="grid size-14 place-items-center rounded-full border border-signal/50 bg-signal/10 text-signal shadow-signal"><MapPin className="size-6" /></div></div><div><p className="text-lg font-semibold">{location}</p><p className="mt-1 text-xs text-muted-foreground">Campus North Sector · Grid 04</p></div></div></aside>
  </div></div></div>;
}

function PageHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{copy}</p></div>; }