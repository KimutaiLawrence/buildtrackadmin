# BuildTrack Admin

![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2-F7D336?style=flat&logo=pinia&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat)

Internal admin portal for the BuildTrack team. Used to review developer photo uploads before they are published to buyers, manage developer accounts, and monitor platform health.

## What it does

- Upload review queue: approve or reject pending developer uploads
- Flagged uploads view: GPS-failed uploads requiring closer scrutiny
- Developer management: list, view, suspend, and update subscription tiers
- Platform statistics: total developers, buyers, uploads, and storage
- Audit log: full trail of every admin and developer action
- Notification log: per-email delivery status from Resend and Brevo

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 Composition API |
| Language | TypeScript |
| Build tool | Vite |
| State management | Pinia |
| Routing | Vue Router 4 |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Icons | Lucide Vue |

## Local setup

Requires Node.js 20+ and the backend running on port 8000.

```bash
git clone https://github.com/KimutaiLawrence/buildtrackadmin.git
cd buildtrackadmin

npm install

cp .env.example .env
# Edit .env -- set VITE_API_URL to the backend URL

npm run dev
```

App available at `http://localhost:5173`.

Log in with `admin@buildtrack.co.ke` / `Admin@2026!` (after running the backend seed script).

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (default: http://localhost:8000) |

## Key files

```
src/
  main.ts                    App entry point
  router/index.ts            Route definitions and auth guard
  stores/
    auth.ts                  Pinia store: login, token, current user
  views/
    LoginView.vue            Admin login page
    DashboardView.vue        Platform stats overview
    FlaggedUploadsView.vue   Upload review queue (approve / reject)
    DevelopersView.vue       Developer list and management
    AuditLogView.vue         Full audit trail
    NotificationLogView.vue  Email delivery log
  components/
    layout/
      Sidebar.vue            Navigation sidebar
      TopBar.vue             Header with user menu
    ui/                      Shared UI primitives (Badge, Table, Modal)
  lib/
    api.ts                   Axios instance with auth interceptor
```
