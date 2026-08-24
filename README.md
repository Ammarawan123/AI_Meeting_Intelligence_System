# Meeting Intel

A mock-driven Next.js front-end for an AI Meeting Intelligence system.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Query
- React Hook Form + Zod
- Axios
- Zustand

## Project structure

- app/ — route entry points and app shell
- context/ — auth and app-level context
- features/auth — login/register + protected route wrapper
- features/dashboard — dashboard overview and meeting list
- features/upload — upload drag-and-drop and status machine
- features/meeting-details — reserved for Phase 2
- shared/hooks — custom hooks that call service functions
- shared/lib — singleton API client, mock adapter, service facade
- shared/mocks — mock JSON fixtures and adapter data
- shared/ui — reusable UI primitives
- types/ — global TypeScript interfaces

## How the mock architecture works

The app is intentionally built with a strict 3-layer flow:

1. UI components call hooks
2. Hooks call service functions
3. Service functions call the mock adapter

This makes it easy to swap in a real backend later without touching components or hooks.

## Swapping to a real backend

This app is intentionally built to be mock-first, but the final frontend contract is backend-ready. The current mock touchpoints are:

- [shared/mocks/meeting-fixtures.ts](shared/mocks/meeting-fixtures.ts) — canonical sample meeting data, transcripts, decisions, action items, and AI insight payloads used by the mock backend
- [shared/lib/mock-adapter.ts](shared/lib/mock-adapter.ts) — adapts raw fixture records into the app’s TypeScript models, injects simulated latency, and exposes the mock API surface for users, meetings, and uploads
- [shared/lib/service.ts](shared/lib/service.ts) — facade layer that keeps the same method names and return shapes future backend endpoints should match
- [shared/hooks/useMeetings.ts](shared/hooks/useMeetings.ts) and [shared/hooks/useMeeting.ts](shared/hooks/useMeeting.ts) — hook entry points that fetch via the service layer and are already backend-contract compatible
- [shared/hooks/useMeetingStatus.ts](shared/hooks/useMeetingStatus.ts) and [shared/store/meeting-status-store.ts](shared/store/meeting-status-store.ts) — mock status progression simulation for uploaded → transcribing → analyzing → completed
- [features/upload/upload-panel.tsx](features/upload/upload-panel.tsx) — upload UI, validation, and processing flow that currently runs against the mock upload response contract
- [context/auth-context.tsx](context/auth-context.tsx) — demo auth behavior currently seeded from mock user data and local persistence, with a real auth provider ready to replace the same interface
- [app/layout.tsx](app/layout.tsx) and the global app shell — banner and mock-mode messaging are intentionally isolated and should be removed or hidden during a real deployment

When swapping to a real backend, keep the same contract surface at the service layer and adapt only the implementation behind it. Components, hooks, and routes should remain unchanged as long as the service methods return the same shapes.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Demo auth

- Email: demo@meetingintel.ai
- Password: demo123

The app accepts the sample user automatically when you sign in or register.
