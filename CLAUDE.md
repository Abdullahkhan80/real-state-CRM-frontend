@AGENTS.md

# CLAUDE.md — NexaEstate CRM Frontend

Premium real estate CRM dashboard: owner-level lead tracking, AI message/call responder
monitoring, custom lead entry, and n8n webhook/integration visibility. Single-page
dashboard backed by the Real Estate CRM API.

## ⚠️ Next.js version

This project is on **Next.js 16.2.9 / React 19**, which has breaking changes vs. older
training data. See `AGENTS.md` (imported above) — **read the relevant guide in
`node_modules/next/dist/docs/` before writing Next.js code** and heed deprecation notices.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`; config in `postcss.config.mjs`, styles in `app/globals.css`)
- **Language:** TypeScript 5 (`strict: true`)
- **Lint:** ESLint 9 + `eslint-config-next`

## Commands

```bash
npm run dev     # next dev (http://localhost:3000)
npm run build   # next build
npm start       # next start (serve production build)
npm run lint    # eslint
```

## Architecture

App Router with a single dashboard page. Most logic lives in the `app/_crm/` module
(the `_crm` underscore prefix makes it a non-routable private folder).

```
app/
├── layout.tsx          # root layout + metadata
├── page.tsx            # renders <CrmDashboard />
├── globals.css         # Tailwind v4 entry + global styles
└── _crm/
    ├── dashboard.tsx   # main client component ("use client"): tabs, fetching, state
    ├── components.tsx  # shared UI: Shell, Badge, Field, MetricCard, ...
    ├── data.ts         # types, constants, demo/fallback data, formatters, API base
    └── icon.tsx        # <Icon> component + IconName union
```

- `page.tsx` is a server component that just renders the client `CrmDashboard`.
- `dashboard.tsx` holds nearly all interactivity (tab nav, lead list/create, metrics,
  agent/activity/integration views). It is a client component.
- `data.ts` is the source of truth for shared **types** (`Lead`, `LeadForm`, `LeadStatus`,
  `LeadSource`, `DashboardMetrics`, `BackendLead`, `Tab`, ...), styling maps
  (`sourceStyles`, `statusStyles`), demo/fallback data, and helpers (`formatCurrency`,
  `formatNumber`, `mapBackendLead`, `blankLeadForm`).

## Backend integration

- The backend (`real-state-CRM-Backend`) is a **TypeScript** (ESM) Express + Prisma API;
  run it with `npm run dev` (port 4000). It enforces the `{ success, message, data }` envelope.
- API base: `apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1"`
  (in `app/_crm/data.ts`). Run the backend and set `NEXT_PUBLIC_API_BASE_URL` for non-local.
- The backend returns `{ success, message, data }` envelopes. Lead records come back as
  `BackendLead` and are normalized to the UI `Lead` shape via `mapBackendLead()`.
- The UI degrades gracefully: when the API is unreachable, it falls back to `demoLeads` /
  `fallbackMetrics` and reflects connection state via `ApiState`
  (`"checking" | "connected" | "offline"`).
- Enum values mirror the backend exactly (UPPERCASE): source FACEBOOK/INSTAGRAM/WHATSAPP/
  COLD_CALL, status NEW/CONTACTED/CONVERTED/LOST.

## Conventions

- **Path alias:** `@/*` maps to the project root (e.g. `@/app/_crm/data`).
- Add new shared types, constants, and formatters to `app/_crm/data.ts`; keep reusable UI
  in `components.tsx` and icons in `icon.tsx`.
- Components that use hooks/state/effects need `"use client"`.
- Style with Tailwind utility classes; follow the existing `*Styles` maps for source/status
  badges rather than hardcoding colors.
- Keep frontend enum unions in sync with the backend Prisma enums when either changes.

## Environment

- `NEXT_PUBLIC_API_BASE_URL` — backend API base; defaults to `http://localhost:4000/api/v1`.
