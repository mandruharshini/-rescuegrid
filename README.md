# RescueGrid

RescueGrid is a frontend-first campus emergency response demo. It includes role-specific Student, Responder, and Admin experiences, an animated 3D command map, interactive incident reporting, responder status workflows, backup requests, notifications, analytics, and history.

## Requirements

- Bun 1.2+ (recommended) or Node.js 20+
- No API keys or external services are required

## Run locally

```bash
bun install
bun run dev
```

Open the local URL shown by Vite (normally `http://localhost:3000`).

## Production build

```bash
bun run build
bun run preview
```

Additional checks:

```bash
bun run test
bun run lint
```

## Demo guide

Use the role selector in the upper-right corner to switch experiences:

- **Student:** choose an emergency type, capture browser GPS (with a campus fallback), attach a local photo, submit a report, and track reports.
- **Responder:** inspect assignments, activate route guidance, progress incident status, and request backup.
- **Command Admin:** monitor the live campus map, inspect incidents and units, advance response states, review analytics, and search history.

All demo mutations are kept in memory and reset after a page refresh. Uploaded photos stay local and are not transmitted.

## Architecture

- **Framework:** TanStack Start, React 19, TypeScript
- **UI:** Tailwind CSS v4 and shadcn/ui primitives
- **3D:** React Three Fiber, Three.js, and Drei
- **Motion:** Motion for React
- **State:** Zustand
- **Charts:** Recharts

Domain types and seeded data live in `src/lib`. The Zustand store is the UI-facing data boundary; this makes it straightforward to replace local actions with HTTP calls later.

## Connecting FastAPI and PostgreSQL later

1. Keep the existing TypeScript domain types as API response contracts (or generate them from an OpenAPI schema).
2. Add a client adapter with methods such as `listIncidents`, `createIncident`, `updateIncidentStatus`, `requestBackup`, and `listResponders`.
3. Replace Zustand's seeded mutations with TanStack Query queries/mutations that call the FastAPI service.
4. Add real authentication and enforce Student/Responder/Admin authorization on the server.
5. Store uploaded evidence using signed object-storage uploads; persist only metadata and URLs in PostgreSQL.
6. Add WebSocket or Server-Sent Events subscriptions for live incident and responder updates.

Never rely on the frontend role switcher for production authorization. It exists only to make this local demo immediately testable.

## Deployment

The project builds as a TanStack Start application and can be deployed directly from Lovable, or to a compatible edge/JavaScript host. Run `bun run build` before deployment and configure any future backend base URL through environment-specific settings.