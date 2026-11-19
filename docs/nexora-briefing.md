# Nexora — Project Briefing for an AI Assistant

> **How to use this file:** paste or attach it at the start of a conversation with an AI assistant that has **no access to the repository**. It is self-contained: it describes what the project is, how it is organized, the data models, the main flows, and every architectural decision with its rationale.
>
> **Suggested opening prompt:**
> *"You are a senior React engineer joining the Nexora project. Read the briefing below. Treat the 'Decisions' section as binding unless I explicitly ask to change one. When you propose code, follow the conventions and layer rules described here, and explain trade-offs."*

---

## 1. What Nexora is

Nexora is a **CRM (contacts, deals, sales pipeline) built as a portfolio piece to demonstrate senior-level React engineering**. The domain is intentionally familiar so that attention goes to the engineering: state normalization, validation boundaries, offline fallbacks, edit locks over WebSockets, virtualization, theming, accessibility and testing.

Key facts:
- **Runs 100% in the browser by default.** Data is seeded from mock files into Redux, and every async operation has a local fallback. No backend is needed to use every feature.
- A real backend can be enabled with one env variable (`VITE_BACKEND_ENABLED=true`): REST at `/api`, socket.io at `/ws` (both proxied by Vite to `localhost:8080`).
- Demo login accepts any e-mail and password; the demo user is an **Admin** with all permissions.
- UI language is English (i18n-ready). Product name and logo: **Nexora** (a gradient blue→violet rounded square with a white "N" drawn as three connected nodes).

Features: login with role-based permissions · dashboard (totals + weighted pipeline value) · virtualized contacts table with search, filter popover (status/source/owner/tags), sortable columns and bulk selection · create/view/edit/delete drawers for contacts and deals · kanban pipeline by deal stage · CSV export · notifications (seeded + generated from user actions) · settings (currency, page size, dark mode) persisted to localStorage · edit locks for simultaneous editing (when a backend exists).

---

## 2. Tech stack (and why each piece is there)

| Library | Version | Role | Why it was chosen |
|---|---|---|---|
| React | 19.1 | UI | Standard; automatic batching keeps form/drawer flows predictable. |
| TypeScript | 5.8, strict | Types | `strict`, `noUnusedLocals/Parameters`, no `any`. Types derived from Zod (`z.infer`) so runtime and compile-time never drift. |
| Vite + SWC | 6.3 | Dev/build | Fast HMR, built-in proxy for `/api` and `/ws`, live type checking (`vite-plugin-checker`), manual chunks (vendor/antd/redux/router). |
| Redux Toolkit | 2.5 | Global state | Normalized entities, memoized selectors, async thunks and listener middleware in one tool. Immer for immutable updates. |
| TanStack Router | 1.170 | Routing | Typed routes and search params, `beforeLoad` guards with typed context, `validateSearch` with Zod. |
| TanStack Table + Virtual | 8.20 / 3.13 | Table | Headless sorting/filtering (markup stays ours) + windowing (only visible rows render). |
| Ant Design | 5.24 | Components | Enterprise forms, drawers, selects, date pickers; token theme with dark algorithm; `App.useApp()` for themed modals/messages. |
| styled-components | 6.1 | Styling | Co-located, prop-driven styles with transient `$props`, built on shared design tokens. |
| Zod | 3.24 | Validation | One schema = validation + type; composition (`omit/extend/partial/or/catch`) for create/edit/import variants. |
| i18next + react-i18next | 24 / 15 | i18n | Namespaced JSON, interpolation, plurals (`_one` / `_other`). |
| Axios | 1.9 | HTTP | Interceptors centralize CSRF, 401 redirect, maintenance mode, error translation. |
| socket.io-client | 4.8 | Realtime | Rooms, reconnection, acknowledgements with timeout. |
| date-fns · dayjs | 4 · (via antd) | Dates | date-fns for display formatting; dayjs because antd's DatePicker uses it. |
| Vitest + Testing Library | 3.1 / 16 | Tests | Shares Vite config/aliases; jsdom; role-based queries. |
| ESLint · Husky · lint-staged | — | Quality | `strictTypeChecked`, hooks rules, ban on relative `../` imports, pre-commit lint, commit-message convention. |

Commands: `npm run dev` (port 3000) · `npm run test` · `npm run typecheck` · `npm run build`.

---

## 3. Folder structure

All imports use **path aliases** (`@atoms/*`, `@molecules/*`, `@organisms/*`, `@containers/*`, `@pages/*`, `@redux/*`, `@services/*`, `@hooks/*`, `@context/*`, `@models/*`, `@validators/*`, `@assemblers/*`, `@helpers/*`, `@appTypes/*` → `src/types`, `@config/*`, `@styles/*`, `@HOC/*`, `@router/*`, `@mock/*`). Relative `../` imports are banned by ESLint. Tests live next to the file they test (`x.ts` + `x.test.ts`). One component per folder, named after it.

```
src/
├─ index.tsx                     entry; antd StyleProvider with px→rem transformer
├─ App.tsx                       provider tree + antd theme (light/dark, Menu tokens)
├─ HOC/GrantChildrenHOC.tsx      permission-gated rendering
├─ assemblers/                   API ↔ form transforms (Contact, Deal, Activity)
├─ components/
│  ├─ atoms/                     Avatar, Button, Icon, Logo, ResizableVirtualElement, SearchInput, StatusTag
│  ├─ molecules/                 ActivityItem, ContactCard, DealCard
│  └─ organisms/                 ActivityFeed, ContactTable, DealPipeline
├─ config/
│  ├─ backend/backend.config.ts  BACKEND_ENABLED flag + BackendDisabledError
│  ├─ i18n/config.ts + en/*.json 11 namespaces: common, label, contacts, deals, activities,
│  │                             companies, dashboard, settings, errors, auth, pipeline
│  └─ setupTests.ts              jsdom polyfills (ResizeObserver, matchMedia)
├─ containers/
│  ├─ Contacts/                  ContactsContainer (toolbar, filters, export, bulk delete), ContactDrawer
│  ├─ Deals/                     DealsContainer, DealDrawer
│  └─ Dashboard/                 DashboardContainer
├─ context/
│  ├─ AuthContext/               AuthContext.tsx + auth-storage.ts (sessionStorage `crm_auth`)
│  ├─ WebSocketContext/          socket instance, emit with ack timeout, rooms
│  ├─ SimultaneousEditingContext/ edit locks
│  └─ AsyncCacheContext/         in-memory TTL cache
├─ helpers/                      date (date-only ISO), format (currency/date), form (Zod→antd errors),
│                                download (queue + CSV builder), socket (ack unwrap)
├─ hooks/                        useAppStore, useContactSearch, useAbortableLock, useSocket, useStableDebounce,
│                                useAsync, useOptionSearch, useTableActions
├─ mock/                         contacts, deals, notifications seed data
├─ models/                       interfaces & enums (Contact, Deal, Activity, Company, Common)
├─ pages/                        Login, Layout/AppLayout, Dashboard, Contacts, Deals, Pipeline, Notifications, Settings
├─ redux/
│  ├─ store.ts                   reducers, preloaded notifications, listener middleware, preference persistence
│  ├─ thunk.ts                   typed createAsyncThunk wrapper
│  └─ <slice>/slice.ts|actions.ts  contacts, deals, companies, activities, pipelines, users,
│                                   notifications (+ listeners.ts), preferences, ui, auth
├─ router/                       router.ts (route tree), guards.tsx (pending/error components),
│                                search/schemas.ts (Zod), search/serializer.ts
├─ services/                     RequestService (single Axios instance) + Contact/Deal/Activity services
├─ styles/                       colors.ts (tokens + theme-aware CSS vars), ThemeTokenStyles.tsx
├─ types/                        AsyncStatus, QueryParams, PaginatedResponse, WSResponse
└─ validators/                   Zod schemas (Contact, Deal, Activity, Company)
public/favicon.svg               Nexora mark
docs/architecture-guide.html     long-form EN/PT guide for humans
```

---

## 4. Data models

```ts
enum ContactStatus { Lead='lead', Qualified='qualified', Customer='customer', Churned='churned' }
enum ContactSource { Website='website', Referral='referral', LinkedIn='linkedin', ColdCall='cold_call', Event='event', Other='other' }

interface Contact {
  id: string; firstName: string; lastName: string; email: string; phone: string;
  companyId: string; status: ContactStatus; source: ContactSource; jobTitle: string;
  tags: string[]; notes: string; ownerId: string; lastContactedAt: string | null;
  createdAt: string; updatedAt: string;
}

enum DealStage { Prospecting='prospecting', Qualification='qualification', Proposal='proposal',
                 Negotiation='negotiation', ClosedWon='closed_won', ClosedLost='closed_lost' }
enum DealPriority { Low='low', Medium='medium', High='high', Critical='critical' }

interface Deal {
  id: string; title: string; value: number; currency: string; stage: DealStage;
  priority: DealPriority; probability: number; contactId: string; companyId: string;
  pipelineId: string; ownerId: string; expectedCloseDate: string; // 'YYYY-MM-DDT00:00:00.000Z' or ''
  tags: string[]; notes: string; createdAt: string; updatedAt: string;
}

enum UserRole { Admin='admin', Manager='manager', Sales='sales', Viewer='viewer' }
interface User { id: string; name: string; email: string; avatar: string | null; role: UserRole; teamId: string | null; isActive: boolean }

interface Notification {
  id: string; type: 'deal_update' | 'contact_assigned' | 'activity_due' | 'mention' | 'system';
  title: string; message: string; entityId: string | null;
  entityType: 'contact' | 'deal' | 'activity' | null; isRead: boolean; createdAt: string;
}
```

Also: `Company`, `Activity` (type call/email/meeting/note/task; status pending/completed/cancelled), `Pipeline` with `PipelineStage[]`. Form types are derived: `ContactFormData = Omit<Contact, 'id'|'createdAt'|'updatedAt'>`, `ContactEditData = Partial<Omit<Contact,'id'>>`.

Permissions (string keys): `contacts.create|edit|delete|export|import|bulkEdit`, `deals.create|edit|delete`. Admins pass every check.

---

## 5. Architecture

### 5.1 Layers (each may only depend on layers below)

| Layer | Responsibility | Must not |
|---|---|---|
| **Pages** | Route shells; read UI slice state (which drawer is open) and compose containers + drawers | Hold business logic |
| **Containers** | Dispatch thunks, run Zod, choose payloads, gate permissions | Call Axios/services directly |
| **Organisms / Molecules / Atoms** | Presentational; data + callbacks via props | Import Redux, services or contexts |
| **Redux** | Slices, selectors, thunks, listener middleware | Import components |
| **Services** | Typed HTTP per resource on top of `RequestService` | Know React/Redux |
| **Models / Validators / Assemblers / Helpers** | Pure, framework-free | Side effects |

Atomic Design is applied pragmatically: atoms wrap antd to enforce tokens (`Button` adds `compact`; `Icon` maps names to icons and accepts token names or raw colors; `StatusTag` maps enums to accessible color pairs).

### 5.2 Provider tree (order is deliberate)

```
StyleProvider (px→rem)
└─ Redux <Provider>                      theme + auth read/write the store
   └─ antd <ConfigProvider>               light/dark algorithm; Menu selected item = white on primaryActive
      ├─ <ThemeTokenStyles/>              antd tokens → CSS variables on :root
      └─ <AntApp>                         context for themed modal/message
         └─ <AuthProvider>                session; dispatches authLoaded/authCleared
            └─ <AsyncCacheProvider>
               └─ <WebSocketProvider>     socket created synchronously, connected in effect
                  └─ <SimultaneousEditingProvider>   locks (needs the socket)
                     └─ <RouterProvider context={{ isAuthenticated }}>
```

`InnerApp` calls `router.invalidate()` whenever `isAuthenticated` changes so guards re-run (logout immediately leaves protected routes).

### 5.3 Routing

```
root (errorComponent)
├─ authenticated (pathless; beforeLoad: if !context.isAuthenticated → redirect('/login'))
│  ├─ /                 Dashboard     ?period=7d|30d|90d|1y
│  ├─ /contacts         Contacts      ?page&pageSize&search&status&source&sortField&sortOrder
│  ├─ /deals            Deals         ?page&pageSize&search&stage&priority&pipelineId&view&sort…
│  ├─ /pipeline/$id     Pipeline (deals filtered by pipelineId)
│  ├─ /settings
│  └─ /notifications
└─ guest
   └─ /login
```

Search params are validated with Zod; **every field uses `.catch(default)`** so invalid URLs fall back instead of crashing. A custom serializer turns digit-only strings into numbers and `true/false` into booleans, so text params accept numbers (`z.union([z.string(), z.number()]).transform(String)`).

### 5.4 State placement

- **Redux**: shared serializable domain data — contacts, deals, companies, activities, pipelines, users, notifications, preferences, UI (drawer open/mode/entityId), auth mirror.
- **Context**: non-serializable/lifecycle things — auth session + permission functions, socket, locks, TTL cache.
- **Local state**: contact filters (`useContactSearch`), table sorting, antd form values, lock-failure flags.

Redux patterns:
- **Normalized slices**: `items: Record<id, T>` + `ids: string[]` (+ `total`, `status`, `selectedIds`). Lists via memoized `createSelector`. Derived values (weighted pipeline value = Σ value × probability/100) are selectors, never stored.
- **Thunks with offline fallback** (typed wrapper converts thrown errors to `rejectWithValue`):

```ts
export const updateDeal = createAsyncThunk('deals/updateDeal', async (arg) => {
  const { id, payload, current } = arg as { id: string; payload: DealEditPayload; current: Deal };
  try {
    return await DealService.updateDeal(id, payload);
  } catch {
    return { ...current, ...payload, updatedAt: new Date().toISOString() } as Deal; // demo mode
  }
});
```

- **Side effects in listener middleware**, not reducers: `redux/notifications/listeners.ts` reacts to create/update/delete of contacts and deals and dispatches `notificationReceived` (IDs/timestamps generated there; `getOriginalState()` recovers names of deleted entities; stage changes produce "Deal moved to {stage}").
- **Seeding**: contacts/deals via slice `initialState`; notifications via `preloadedState` in `store.ts` (so slice unit tests start empty).
- **Preferences persistence**: `initialState: loadPreferences` (merges stored values over defaults, type-checked per key) + `store.subscribe` saving to `localStorage['crm_preferences']` only when the slice reference changes.

### 5.5 Backend switch

```ts
// config/backend/backend.config.ts
export const BACKEND_ENABLED = import.meta.env.VITE_BACKEND_ENABLED === 'true';
```

When false: every `RequestService` method rejects with `BackendDisabledError` **before** calling Axios, `enqueueDownload` rejects the same way, and the socket never connects. Thunks then use their local fallback. This avoids Vite proxy `ECONNREFUSED` noise and slow timeouts.

---

## 6. Main workflows

**Login & F5 restore** — LoginPage → `login(user, permissions)` sets React state, writes `sessionStorage.crm_auth`, dispatches `authLoaded` → router context updates + `invalidate()`. On reload, `useState(() => readSession())` restores synchronously before the first render (route guards see it); corrupted sessions are removed; an effect mirrors it into Redux. Logout (user menu on the sidebar avatar) clears storage + Redux and navigates to `/login`.

**Create contact** — "Add Contact" (inside `GrantChildrenHOC contacts.create`) dispatches `openContactDrawer({mode:'create'})` → `ContactsPage` passes UI state as props → drawer effect keyed on `[open, mode, contact]` applies defaults (Lead / Website) on **every** open → antd rules + `contactAddSchema.safeParse` (Zod issues mapped to fields with `applyZodErrorsToForm`; `validateFields` wrapped in try/catch) → `createContact` thunk (service guarded → local fallback with `crypto.randomUUID()`) → reducer adds to `items` and `unshift`s id → memoized list → table re-renders → listener adds a notification → sidebar badge increments.

**Edit deal with lock** — card click → view drawer (Edit/Delete buttons each behind `GrantChildrenHOC`) → Edit switches mode to `edit` → `useAbortableLock('deal', id, userId, enabled)` acquires via `socket.timeout(5000).emit('lock:acquire')` → result `acquired` | `failed` (error ack or timeout → read-only form + warning) | `offline` (no connection → editing allowed) → `lock:changed` from another user updates lock **state** → warning appears immediately → Save sends **only the 8 form fields** (title, value, probability, stage, priority, contactId, expectedCloseDate, notes) → merge preserves currency/company/pipeline/tags.

**Contacts table** — `useContactSearch` filters (search by name/email, status, source, owner, tags) and counts active filters ("Filter (n)"); TanStack Table sorts (default `createdAt` desc; name column uses `accessorFn` first+last; select/actions not sortable; headers expose `aria-sort`); TanStack Virtual renders visible rows (`translateY`, overscan 10); header checkbox computed over **visible** ids with union/difference toggling; checkbox cell stops click propagation so it never opens the row drawer; empty state when no rows.

**Delete & export** — `modal.confirm` from `App.useApp()`; delete reducer removes from `items`, `ids` and `selectedIds`. Export tries `/api/contacts/export` through a download queue (max 3 concurrent); on rejection builds an RFC 4180 CSV client-side with UTF-8 BOM; `revokeObjectURL` is deferred.

**Dark mode** — Settings switch → `toggleTheme` (persisted) → ConfigProvider `darkAlgorithm` → `ThemeTokenStyles` writes `--crm-*` CSS variables from `theme.useToken()` → every styled component using `Colors.*` updates automatically.

**Realtime events** — `contact:updated|deleted` (ContactsContainer), `deal:updated` (DealsContainer), `lock:changed` (SimultaneousEditingProvider), `notification:new` (AppLayout). `useSocket(room, event, cb)` joins/leaves rooms and keeps the callback in a ref to avoid resubscribing.

---

## 7. Decisions (binding) — with rationale

1. **Edits send only fields the form renders.** The offline fallback merges `{...current, ...payload}`; any default injected into an edit (`currency:'USD'`, `tags:[]`, `pipelineId:''`, `ownerId`) overwrites real data. Defaults are for *create* only. New deals get the default pipeline id (first loaded pipeline, else the seeded one).
2. **Session restored with a lazy initializer**, not in `useEffect` — effects run after the first render, too late for route guards.
3. **Drawers re-apply form values on every open** (effect depends on `open`), because closing calls `resetFields()`. Drawers use `forceRender` to keep the form instance connected.
4. **Two validation layers**: antd rules for instant UX; Zod `safeParse` as the contract. Never leave `validateFields()` rejections unhandled.
5. **Calendar dates are date-only**: store `YYYY-MM-DDT00:00:00.000Z`; read `dayjs(iso.slice(0,10))`; write `date.format('YYYY-MM-DD') + 'T00:00:00.000Z'`. Never `dayjs(iso)` / `toISOString()` on picked dates (off-by-one-day across timezones).
6. **Numeric parsing is explicit**: empty probability → 50. `Number(x) ?? fallback` is a bug because `NaN` isn't nullish. Numeric fields use `InputNumber` with `type:'number', min, max` rules.
7. **URL is untrusted input**: `.catch(default)` on every search param; root `errorComponent`.
8. **Socket created synchronously** (`useState(socketFactory)`), connected in an effect — children's effects run before parents', so a socket created in the provider's effect would be `null` when children subscribe. `io({ path: '/ws' })` (the first arg of `io()` is a namespace, not a path).
9. **Locks**: ack timeout; three-state result; **offline doesn't block editing** (otherwise the demo is read-only); locks stored in React state so changes re-render; release waits for an in-flight acquire.
10. **Theme bridge via CSS variables**: theme-aware tokens are `var(--crm-x, lightFallback)`. Colors needing guaranteed contrast use explicit `{light, dark}` values (antd's `*TextActive` tokens get darker in dark mode). All text ≥ 4.5:1 contrast in both themes.
11. **`theme` is reserved by styled-components** — `styled(Layout.Sider)` swallows `theme="light"`. Wrap the antd component first, then style the wrapper.
12. **Permissions are declarative** (`<GrantChildrenHOC authorizationKey keyMatch fallback>`), keeping the rule next to the element it protects.
13. **Modals/messages via `App.useApp()`** so they inherit the theme.
14. **Redux thunks instead of a server-cache library**: offline-first local mutations and normalized entities shared across pages/dashboard/sockets. Cost: manual invalidation (an `AsyncCacheContext` exists for read caching).
15. **Virtualize the table from day one**: DOM size is the bottleneck at CRM scale. Cost: fixed-height scroller; layout stubs in tests.
16. **i18n everywhere**: no hard-coded UI strings; enum values are translation keys; plurals via `_one/_other`.

---

## 8. Conventions for writing code

- Strict TypeScript, no `any`, no non-null assertions, no nested ternaries (use `if/else` to compute a variable).
- Path aliases only; new top-level folders need an alias in both `tsconfig.paths.json` and `vite.config.ts`.
- Styled components use tokens from `@styles/colors` (`Colors`, `Spacing` 4px scale in rem, `FontSize`, `BorderRadius`, `Shadow`). `html { font-size: 10px }` so `1.6rem = 16px`.
- Transient props for styled components (`$isSelected`, `$width`).
- Containers own business rules; organisms stay prop-driven and testable in isolation.
- Commit messages: `STORY-1234: description` or `NOSTORY: description` (enforced by a husky hook).
- Definition of done: `tsc --noEmit` clean + all Vitest tests green (currently 216 tests in 33 files).

## 9. Testing approach

- **Pure units**: validators, assemblers, helpers (date tests also run with `TZ=Asia/Tokyo` / `America/Sao_Paulo`), search schemas.
- **Redux**: real `configureStore` per test; assert on resulting state. For thunks dispatched into a partial store: `store as typeof store & { dispatch: AppDispatch }`.
- **Hooks/context**: `renderHook` with real providers; `WebSocketProvider` accepts `socketFactory`, `ackTimeoutMs`, `enabled` so a mock socket can simulate acks, timeouts, server pushes and offline mode.
- **Components**: Testing Library by role/label; import the i18n config in the test; open drawers by dispatching UI actions; jsdom needs `clientHeight/clientWidth` stubs for the virtualizer; antd confirm dialogs can render twice (`findAllByText(...)[0]`).
- Regression tests read like specs, e.g. "editing only notes keeps companyId, pipelineId, tags and currency".

## 10. Known gaps / roadmap

- URL search params are validated but the contacts table still uses local filter/sort state (decide whether the URL should be the source of truth).
- The page-size preference has no paginated list to apply to.
- Activities: feed, assembler and service exist but aren't mounted; "Activities Due" is 0.
- Pipeline drag-and-drop between stages (`updateDealStage` thunk is ready).
- Clicking a notification could open the related entity.
- Tooling: ESLint config imports `typescript-eslint`, which isn't installed (lint can't run); `dayjs` is used but only installed transitively via antd; `lodash`, `msw`, `@testing-library/user-event`, `vite-plugin-svgr` are declared but unused; `validate-i18n` script is missing; antd v5 warns about React 19 (needs `@ant-design/v5-patch-for-react-19`).
- Ready but unused building blocks: `useAsync` + `AsyncCacheContext`, `useOptionSearch`, `useTableActions`, `ContactCard`, `ResizableVirtualElement`, `DealAssembler`.
- The Import Contacts button was removed on purpose; the `contacts.import` permission and `contactImportSchema` remain.

## 11. History (context for "why is it like this?")

The project went through a manual QA pass (91 acceptance criteria, 136 test cases) that found 20 bugs. All were fixed: session lost on reload, deal edit wiping fields, missing deal edit/delete UI, missing logout, drawer defaults lost on reopen, invalid URL params crashing routes, checkbox opening the drawer, broken sorting, timezone date shift, NaN probability, export without fallback, wrong socket path, lock promise without timeout / no re-render, select-all inconsistency under search, ghost selection after delete, incomplete dark mode, currency preference ignored, silent validation failures, no filter UI, wrong labels / hard-coded strings. Each fix is covered by a regression test. Afterwards: the backend became opt-in, contrast issues were fixed (sidebar theme bug, menu selection, status tags), the product was renamed to Nexora with its own logo, and notifications became live.
