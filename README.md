# Whoami

A small learning monorepo for understanding web authentication from both sides of
the HTTP connection.

## Workspaces

- `frontend` — the existing React and Vite interface.
- `backend` — a minimal Node.js and Express server. Authentication will be added
  one method at a time; there are no auth routes yet.

## Run the projects

Install all workspace dependencies from the repository root:

```bash
npm install
```

Run the frontend at `http://localhost:5173`:

```bash
npm run dev:frontend
```

Run the backend at `http://localhost:3000`:

```bash
npm run dev:backend
```

The backend intentionally returns Express's default `404` response until the first
authentication lesson adds an endpoint.
