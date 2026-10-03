import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/rescuegrid/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RescueGrid — Campus Emergency Command" },
      { name: "description", content: "Real-time campus emergency reporting, dispatch, and response coordination." },
      { property: "og:title", content: "RescueGrid — Campus Emergency Command" },
      { property: "og:description", content: "A unified emergency response network for safer campuses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppShell,
});