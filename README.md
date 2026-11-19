<p align="center">
  <img src="public/favicon.svg" width="72" height="72" alt="Nexora logo" />
</p>

<h1 align="center">Nexora</h1>

<p align="center">
  A React example case — a CRM built to showcase frontend architecture.
</p>

---

> **This is a study / portfolio case, not a product.** Nexora exists only to demonstrate how a React application can be structured: layered architecture, state management, validation, routing, theming and testing. There is no real backend and no real customer data; everything runs in the browser with seeded mock data.

## Architecture

Every folder, component, workflow and decision (with its rationale) is documented in **[docs/nexora-briefing.md](docs/nexora-briefing.md)**.

## Stack

React 19 · TypeScript (strict) · Vite · Redux Toolkit · TanStack Router / Table / Virtual · Ant Design · styled-components · Zod · i18next · socket.io-client · Vitest + Testing Library

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000 — log in with any e-mail and password
npm run test       # unit and component tests
npm run typecheck
npm run build
```

An optional backend can be enabled with `VITE_BACKEND_ENABLED=true` in `.env.local` (REST on `/api` and socket.io on `/ws`, proxied to `localhost:8080`). It is not required to run the app.
