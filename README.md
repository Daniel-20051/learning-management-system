# Learning Management System

This repository now hosts two React/Vite applications:

| App | Path | Purpose |
| --- | --- | --- |
| Student & Staff Portal | `./` | Course delivery, student experience, staff tooling |
| Super Admin Portal | `./admin-app` | Dedicated experience for managing students, staff, admins, and activity logs |

Both apps share the same design system, hooks, and API layer, but they are built and deployed separately so the admin experience can live on an isolated URL.

## Prerequisites

- Node.js 18+
- npm 10+

## Installing dependencies

```bash
# student + staff portal
npm install

# admin portal
cd admin-app
npm install
```

## Running locally

```bash
# student + staff portal
npm run dev

# admin portal
cd admin-app
npm run dev
```

Each app runs its own Vite dev server. Point `VITE_ADMIN_PORTAL_URL` in the main app to the admin dev URL if you want the "Login as Admin" button to work locally.

## Environment variables

| App | Variable | Description |
| --- | --- | --- |
| Main portal | `VITE_ADMIN_PORTAL_URL` | Absolute URL to the deployed admin portal (used for redirects) |
| Admin portal | `VITE_MAIN_APP_URL` | Optional URL back to the main experience (used by the “Back to student login” button) |

Populate these values in your `.env` files (`.env.local`, `.env.production`, etc.) for each app.

## Build commands

```bash
# student + staff portal
npm run build

# admin portal
cd admin-app
npm run build
```

Each build outputs to its respective `dist/` folder and can be deployed onto independent domains or hosting targets.
