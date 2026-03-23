# BGIS Implementation Tracker

A project tracking tool built for BGIS implementation consultants to manage IWMS (Integrated Workplace Management System) rollouts — such as Archibus, Tririga, or Maximo — from kick-off through go-live.

## What it does

The tracker gives a single place to manage everything that matters during a client implementation:

- **Dashboard** — Executive-ready KPI view showing overall completion %, project risk level, RAG status, days to go-live, UAT summary, and a weekly status update editor.
- **Project Setup** — Create and manage one or more projects with key details: client, system, sponsor, start date, target go-live, and complexity rating.
- **Workbook** — Track configuration tasks and deliverables by category (Space Management, Work Orders, Integrations, Reporting, etc.) with status and ownership.
- **Milestones** — Progress through the standard implementation phases: Discovery → Requirements → Configuration → UAT → Sign-Off → Go-Live, with owners, target dates, and notes.
- **UAT Board** — Manage user acceptance testing scenarios with priority, tester assignment, pass/fail status, and defect notes.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Routing | Wouter |
| State / Data fetching | TanStack Query |
| UI components | shadcn/ui + Radix UI + Tailwind CSS v4 |
| Backend | Express (Node.js), in-memory store |
| Forms | React Hook Form + Zod |

## Getting started

**Install dependencies**

```bash
npm install
```

**Start both the API and the frontend**

```bash
npm run dev:all
```

This runs the Express API on `http://localhost:3000` and the Vite dev server on `http://localhost:5173` concurrently. Open [http://localhost:5173](http://localhost:5173) in your browser.

**Start them separately (optional)**

```bash
# Terminal 1 — API
npm run dev:api

# Terminal 2 — Frontend
npm run dev
```

## Project structure

```
├── api/
│   └── index.ts           # Express API — all routes, in-memory data store
├── artifacts/
│   └── bgis-tracker/
│       └── src/
│           ├── components/ # UI components (shadcn/ui + layout)
│           ├── hooks/      # Custom React hooks
│           ├── lib/        # Query client, project context, utilities
│           └── pages/      # Dashboard, ProjectSetup, Workbook, Milestones, UatBoard
├── src/
│   └── api-client.ts      # Typed API client (hooks for all endpoints)
├── vite.config.ts
└── package.json
```

## Notes

- Data is held **in memory** — it resets every time the API server restarts. A demo project is preloaded on start so the app is immediately usable.
- The app supports multiple projects. Use **Project Setup → Start New Project** to add more.
- Complexity (Low / Medium / High) feeds the risk scoring algorithm on the dashboard.
