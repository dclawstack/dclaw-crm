# CRM — v1.2 Feature Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.
> **Do NOT introduce dark mode.** All UI must use the strict light-mode design system defined below.

---

## Design System — STRICT RULES (Light Mode Only)

Source of truth: `colors_and_type.css` (DKube brand system). All frontend work MUST use these tokens mapped through shadcn CSS variables. No hardcoded hex/rgb. No `dark:` Tailwind variants.

### Brand Identity

- **Font:** Poppins (300–800 weights) — local fonts at `/fonts/poppins-*.woff2`
- **Primary color:** `#7660A8` (DKube purple-700) — logo dark face, buttons, links
- **Secondary purple:** `#9384BD` (DKube purple-500) — logo light face, accents
- **Page background:** `#F8F8FA` (dk-gray-50) — warm near-white, not pure white
- **Ink / headlines:** `#0F0F12` (dk-ink)
- **Body copy:** `#404049` (dk-gray-700)
- **Meta text:** `#7A7A85` (dk-gray-500)

### CSS Token Reference (from `colors_and_type.css`)

| DKube Token | Hex | Usage |
|-------------|-----|-------|
| `--dk-brand` → `--dk-purple-700` | `#7660A8` | Primary buttons, links, active nav |
| `--dk-brand-hover` → `--dk-purple-800` | `#5C4A8E` | Button hover state |
| `--dk-brand-press` → `--dk-purple-900` | `#4A3878` | Button active/press |
| `--dk-brand-soft` → `--dk-purple-100` | `#F1EEF8` | Soft badge backgrounds, tints |
| `--dk-bg` | `#FFFFFF` | Card backgrounds |
| `--dk-bg-muted` → `--dk-gray-50` | `#F8F8FA` | Page background, table stripes |
| `--dk-bg-tint` → `--dk-purple-50` | `#F8F6FB` | Highlighted row tint |
| `--dk-fg` → `--dk-ink` | `#0F0F12` | Headlines, page titles |
| `--dk-fg-1` → `--dk-gray-700` | `#404049` | Body text |
| `--dk-fg-2` → `--dk-gray-500` | `#7A7A85` | Meta, timestamps, helper text |
| `--dk-fg-muted` → `--dk-gray-400` | `#A3A3AC` | Placeholder, disabled |
| `--dk-border` → `--dk-gray-200` | `#E8E8EC` | Default borders |
| `--dk-border-strong` → `--dk-gray-300` | `#D6D6D6` | Dividers, table lines |
| `--dk-border-brand` → `--dk-purple-300` | `#C9C0DE` | Focus rings, selected borders |

### Semantic Status Colors

| State | Foreground | Background |
|-------|-----------|------------|
| Success | `--dk-success` `#2E8B57` | `--dk-success-bg` `#E6F4EC` |
| Warning | `--dk-warning` `#C28A00` | `--dk-warning-bg` `#FBF1DC` |
| Danger / Destructive | `--dk-danger` `#B3261E` | `--dk-danger-bg` `#FBE9E7` |
| Info | `--dk-info` `#2C6CB0` | `--dk-info-bg` `#E5EFF9` |

### shadcn/ui Token Mapping (globals.css must reflect these)

When updating `globals.css` `:root` to match DKube brand:

```css
--background:    248 100% 98%;    /* #F8F8FA dk-bg-muted — page bg */
--card:          0 0% 100%;       /* #FFFFFF dk-bg — card surfaces */
--foreground:    240 14% 6%;      /* #0F0F12 dk-ink */
--primary:       264 27% 51%;     /* #7660A8 dk-purple-700 */
--primary-foreground: 0 0% 100%;  /* white on purple */
--secondary:     264 27% 63%;     /* #9384BD dk-purple-500 */
--muted:         240 9% 97%;      /* #F2F2F4 dk-gray-100 */
--muted-foreground: 240 5% 50%;   /* #7A7A85 dk-gray-500 */
--border:        240 8% 92%;      /* #E8E8EC dk-gray-200 */
--destructive:   3 74% 40%;       /* #B3261E dk-danger */
--radius: 1rem;                   /* 16px dk-radius-lg for cards */
```

### Typography Scale

| Element | DKube Class / Style |
|---------|---------------------|
| Page title (h1) | `.dk-h1` — Poppins bold, tight tracking, `var(--dk-fg)` |
| Section heading (h2) | `.dk-h2` — Poppins bold, snug line-height |
| Card heading (h4) | `.dk-h4` — Poppins semibold 24px |
| Body | `.dk-body` — Poppins 400 16px, `var(--dk-fg-1)` |
| Meta / label | `.dk-meta` — Poppins 500 14px, `var(--dk-fg-2)` |
| Caption / timestamp | `.dk-caption` — Poppins 500 12px, 0.02em tracking |
| Eyebrow | `.dk-eyebrow` — Poppins 600 14px uppercase, `var(--dk-brand)` |
| Stat / metric | Poppins bold 32px, `var(--dk-fg)` |

### Component Conventions

- **Page background:** `bg-[#F8F8FA]` or `var(--dk-bg-muted)` — not pure white
- **Cards:** `bg-white border border-[#E8E8EC] rounded-2xl` (16px radius) + `shadow-sm`
- **Primary button:** `bg-[#7660A8] text-white hover:bg-[#5C4A8E]` — pill shape `rounded-full` for CTAs
- **Secondary button:** `bg-[#F1EEF8] text-[#7660A8] hover:bg-[#E2DCEE]`
- **Destructive button:** `bg-[#B3261E] text-white`
- **Inputs:** `border-[#E8E8EC] bg-white rounded-xl focus:border-[#C9C0DE] focus:ring-[#7660A8]/20`
- **Table headers:** Poppins 500 12px uppercase `var(--dk-fg-2)` + `var(--dk-border-strong)` bottom border
- **Status badges:**
  - `active` / `won` → `bg-[#E6F4EC] text-[#2E8B57]`
  - `lead` / `prospect` → `bg-[#F1EEF8] text-[#7660A8]`
  - `inactive` / `churned` / `lost` → `bg-[#F2F2F4] text-[#7A7A85]`
  - `warning` / `at-risk` → `bg-[#FBF1DC] text-[#C28A00]`
- **Shadows:** prefer `--dk-shadow-sm` (soft, low-contrast); hover-lift with `--dk-shadow-md`
- **Motion:** `transition-all duration-[240ms]` with `ease-[cubic-bezier(0.22,1,0.36,1)]`

---

## Pre-Flight Checklist — Do This Before Any v1.2 Feature

- [ ] `frontend/package-lock.json` is committed after any `npm install`
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [ ] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- [ ] Backend is on port `8095`, frontend on port `3006`

---

## v1.0 Feature Inventory (Shipped)

- [x] Customer CRUD (create, list, detail, update, delete)
- [x] Deal CRUD with stages: prospecting → qualification → proposal → negotiation → closed_won / closed_lost
- [x] Activity log CRUD (type, description, scheduled_at, completed flag)
- [x] Dashboard: total customers, open deals, pipeline value, win rate, deals-by-stage bar chart, recent activities
- [x] Deal probability field + expected close date
- [x] Customer → Deals and Customer → Activities relationships
- [x] Server-side filtering: deals by stage, activities by customer/deal
- [x] Real PostgreSQL backend (no mocks)
- [x] Docker + Helm deployment
- [x] Alembic migrations (migration: `84518ffd1972`)
- [x] Backend tests (pytest + httpx AsyncClient for all 5 domains)

---

## v1.2 Roadmap

> **Analysis basis:** Features validated against Attio, Twenty (YC S23), Clay, Folk, and item (YC-backed).
> **Principle:** Ship composable primitives first (pipeline view, search, notes), then intelligence layer (AI scoring, enrichment), then platform layer (webhooks, RBAC, audit).

---

### P0 — Must Have (Core Gaps vs. Competitive Baseline)

#### 1. Kanban Pipeline Board

**Why:** Every competitive CRM (Attio, Twenty, Pipedrive, Relate) leads with a visual pipeline. Table-only deal lists cause reps to lose spatial context of the funnel. YC advisors cite this as the #1 "feel" feature that drives adoption.

**Backend:**
- `PATCH /api/v1/deals/{id}/stage` — lightweight stage-move endpoint (returns only updated deal)
- Stage-move triggers an auto-created Activity of type `stage_change` (for audit trail)

**Frontend:**
- `/deals` view: add toggle between **Table** (existing) and **Kanban** (new)
- Kanban: one column per stage, deal cards showing title, customer name, value badge, probability
- Drag-and-drop via native HTML5 drag API (no new deps)
- Stage column totals (count + Σ value) in column header
- Card colors: use `bg-card border-border`; `closed_won` column header accent in `bg-secondary`

**Files:**
- `backend/app/api/v1/deals.py` — add stage-move endpoint
- `frontend/src/app/deals/page.tsx` — add kanban view toggle
- `frontend/src/components/KanbanBoard.tsx` — new component

**Tests:** test stage-move endpoint, verify auto-activity creation

---

#### 2. Global Search

**Why:** Without search, users can't navigate a CRM with >50 records. The most-clicked feature in early Attio and Twenty feedback loops.

**Backend:**
- `GET /api/v1/search?q={query}&limit=10` — searches customers (name, email, company), deals (title), activities (description) using `ilike`
- Returns unified result list: `[{type, id, title, subtitle}]`

**Frontend:**
- Command palette / search bar in nav (keyboard shortcut: `Cmd+K`)
- Results grouped by type (Customers / Deals / Activities)
- Clicking a result navigates to the detail page
- Uses `text-muted-foreground` for subtitles, `text-foreground` for primary match text

**Files:**
- `backend/app/api/v1/search.py` — new router
- `backend/app/api/main.py` — register search router
- `frontend/src/components/GlobalSearch.tsx` — command palette
- `frontend/src/app/layout.tsx` — mount GlobalSearch

**Tests:** test search endpoint with partial matches across all entity types

---

#### 3. Notes on Customers and Deals

**Why:** First thing reps do after a call is write a note. Without inline notes, reps fall back to Notion/Slack and the CRM becomes a ghost town. Attio and Twenty both treat Notes as a first-class object.

**Backend:**
- New `Note` model: `id`, `customer_id` (nullable FK), `deal_id` (nullable FK), `content` (Text), `created_at`, `updated_at`
- `app/repositories/note_repo.py`
- `GET/POST /api/v1/notes/` — filter by `customer_id` or `deal_id`
- `PUT/DELETE /api/v1/notes/{id}`
- Alembic migration for `notes` table

**Frontend:**
- Notes tab/section on Customer detail page (`/customers/[id]`)
- Notes tab/section on Deal detail page (`/deals/[id]`)
- Inline textarea (auto-save on blur or explicit Save button)
- Note list shows `content`, `created_at` in `text-xs text-muted-foreground`

**Files:**
- `backend/app/models/note.py`
- `backend/app/repositories/note_repo.py`
- `backend/app/schemas/note.py`
- `backend/app/api/v1/notes.py`
- `backend/alembic/versions/` — migration
- `frontend/src/app/customers/[id]/page.tsx` — notes section
- `frontend/src/app/deals/[id]/page.tsx` — notes section

**Tests:** full CRUD for notes endpoint

---

#### 4. Activity Completion & Task Queue

**Why:** Activities with `scheduled_at` are meaningless without a task view. YC founders rate "what do I need to do today" as the most-used CRM screen after pipeline.

**Backend:**
- `PATCH /api/v1/activities/{id}/complete` — toggle `completed = true/false`
- `GET /api/v1/activities/due-today` — activities with `scheduled_at::date = today` and `completed = false`
- `GET /api/v1/activities/overdue` — `scheduled_at < now()` and `completed = false`

**Frontend:**
- New `/tasks` page — Today's tasks + Overdue sections
- Checkbox to mark complete (optimistic UI update)
- Each row links to the related customer/deal
- Overdue tasks shown with `text-destructive` date label
- Add to nav sidebar

**Files:**
- `backend/app/api/v1/activities.py` — add complete/due-today/overdue endpoints
- `frontend/src/app/tasks/page.tsx` — new page
- `frontend/src/app/layout.tsx` — add Tasks to nav

**Tests:** test complete toggle, due-today filter, overdue filter

---

#### 5. Customer Status Lifecycle

**Why:** Binary active/inactive is not enough. Modern CRMs track: `lead → prospect → customer → churned`. This is the basis for funnel analytics.

**Backend:**
- Extend `Customer.status` enum: `lead`, `prospect`, `active`, `inactive`, `churned`
- `PATCH /api/v1/customers/{id}/status` — explicit status transition with validation
- Auto-log Activity of type `status_change` on transition

**Frontend:**
- Status badge on customer list and detail — each status gets a distinct style:
  - `lead`: `bg-accent text-accent-foreground`
  - `prospect`: `bg-secondary text-secondary-foreground`
  - `active`: `bg-primary/10 text-primary`
  - `inactive` / `churned`: `bg-muted text-muted-foreground`
- Status dropdown on customer detail page (inline edit)

**Files:**
- `backend/app/models/customer.py` — extend status enum
- `backend/app/api/v1/customers.py` — add status-transition endpoint
- `frontend/src/app/customers/[id]/page.tsx` — status inline edit
- Alembic migration

**Tests:** test all valid/invalid status transitions

---

### P1 — Should Have (Competitive Differentiators)

#### 6. AI Deal Health Score

**Why:** Clay, Attio AI attributes, and Clarify all ship this. Score is computed from: days-in-stage, activity recency, deal value vs. avg, probability vs. stage benchmark. No LLM required for v1 — pure heuristic score (0–100) shipped as a backend computed field.

**Backend:**
- `GET /api/v1/deals/{id}/health` — returns `{score: int, signals: [{label, impact}]}`
- Score formula (configurable weights in `core/config.py`):
  - +25 if activity in last 7 days
  - +20 if probability >= stage benchmark
  - -15 per week stuck in same stage
  - +10 if expected_close_date set and not past
  - -20 if expected_close_date is overdue

**Frontend:**
- Health score pill on deal detail page and deal kanban card
- Color: score ≥70 → `bg-primary/10 text-primary`; 40–69 → `bg-accent`; <40 → `bg-destructive/10 text-destructive`
- Signal tooltip listing contributing factors

**Files:**
- `backend/app/services/deal_health.py` — scoring engine
- `backend/app/api/v1/deals.py` — add health endpoint
- `frontend/src/app/deals/[id]/page.tsx` — health score display

**Tests:** unit tests for scoring formula edge cases

---

#### 7. Audit Log

**Why:** Required for any SaaS targeting SMBs/enterprise. "Who changed this deal?" is the #1 support request in CRMs. Foundation for compliance (SOC2, GDPR).

**Backend:**
- New `AuditLog` model: `id`, `entity_type`, `entity_id`, `action` (created/updated/deleted), `field_name`, `old_value`, `new_value`, `actor_ip`, `created_at`
- Middleware or repository hook that auto-writes audit entries on CUD operations
- `GET /api/v1/audit-log?entity_type=deal&entity_id={id}&limit=50`
- Alembic migration for `audit_log` table

**Frontend:**
- Collapsible "History" section on Customer detail and Deal detail pages
- Timeline list: `action` verb, `field_name`, old→new value, timestamp
- Use `text-xs text-muted-foreground` for all history entries

**Files:**
- `backend/app/models/audit_log.py`
- `backend/app/repositories/audit_log_repo.py`
- `backend/app/api/v1/audit_log.py`
- `backend/alembic/versions/` — migration
- `frontend/src/components/AuditLogTimeline.tsx`

**Tests:** verify audit entries created on deal update, customer status change

---

#### 8. Outbound Webhooks

**Why:** Every YC-funded startup integrating a CRM needs webhooks (Zapier, n8n, internal pipelines). Twenty 2.0, Attio, and Clay all ship webhooks as a core primitive. Without them, the CRM becomes a data silo.

**Backend:**
- New `WebhookEndpoint` model: `id`, `url`, `events` (JSON array), `secret`, `active`, `created_at`
- Events: `customer.created`, `customer.updated`, `deal.created`, `deal.stage_changed`, `activity.created`
- `GET/POST /api/v1/webhooks/` — manage endpoints
- `DELETE /api/v1/webhooks/{id}`
- Delivery via `httpx.AsyncClient` fired as background task after write
- HMAC-SHA256 signature header: `X-DClaw-Signature`
- Retry logic: 3 attempts with exponential backoff
- `WebhookDelivery` log model: `endpoint_id`, `event`, `payload`, `status_code`, `attempts`, `created_at`

**Frontend:**
- `/settings/webhooks` page — list, add, delete endpoints
- Event selector (multi-checkbox)
- Recent delivery log per endpoint (last 10 calls, status code, timestamp)

**Files:**
- `backend/app/models/webhook.py`
- `backend/app/services/webhook_service.py`
- `backend/app/api/v1/webhooks.py`
- `backend/alembic/versions/` — migration
- `frontend/src/app/settings/webhooks/page.tsx`

**Tests:** test webhook creation, delivery attempt, HMAC signature

---

#### 9. CSV Import / Export

**Why:** Every CRM migration starts here. Clay, Folk, and Twenty all ship this in v1. Without it, teams stay on spreadsheets.

**Backend:**
- `POST /api/v1/customers/import` — multipart CSV upload, returns `{imported, skipped, errors[]}`
- `GET /api/v1/customers/export` — streams CSV response
- `POST /api/v1/deals/import` / `GET /api/v1/deals/export`
- Column mapping: `name`, `email`, `phone`, `company`, `status` for customers; `title`, `customer_email`, `value`, `stage` for deals
- Uses Python `csv` stdlib — no pandas

**Frontend:**
- Import button on Customers and Deals list pages → file picker → progress/result modal
- Export button → direct download
- Error display: "3 rows skipped — email already exists"

**Files:**
- `backend/app/api/v1/customers.py` — import/export endpoints
- `backend/app/api/v1/deals.py` — import/export endpoints
- `frontend/src/components/ImportModal.tsx`

**Tests:** test CSV parsing, duplicate detection, error reporting

---

#### 10. Custom Dashboard Date Range Filter

**Why:** "Show me last quarter" is the first question every manager asks. Locked-to-all-time dashboards kill adoption with leadership.

**Backend:**
- Extend `GET /api/v1/dashboard/` to accept `?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD`
- All aggregates (pipeline value, win rate, deals by stage) scoped to date range

**Frontend:**
- Date range picker on Dashboard (from/to inputs using `<input type="date">`)
- Preset buttons: **Today**, **This Week**, **This Month**, **This Quarter**, **All Time**
- Dashboard re-fetches on range change

**Files:**
- `backend/app/api/v1/dashboard.py`
- `frontend/src/app/page.tsx` — date range picker UI

**Tests:** test dashboard aggregates with date range params

---

#### 11. Contacts (People inside Companies)

**Why:** Attio and Twenty model this as People + Companies. A single `Customer` conflating both causes pain at scale (multiple contacts per company). This extends the data model without a breaking migration.

**Backend:**
- New `Contact` model: `id`, `customer_id` (FK → Customer/Company), `name`, `email`, `phone`, `title`, `is_primary`, `created_at`
- `GET/POST /api/v1/customers/{id}/contacts/`
- `PUT/DELETE /api/v1/contacts/{id}`
- Alembic migration for `contacts` table

**Frontend:**
- Contacts tab on Customer detail page
- List shows name, title, email, phone; primary contact starred
- Inline add contact form

**Files:**
- `backend/app/models/contact.py`
- `backend/app/repositories/contact_repo.py`
- `backend/app/schemas/contact.py`
- `backend/app/api/v1/contacts.py`
- `backend/alembic/versions/` — migration
- `frontend/src/app/customers/[id]/page.tsx` — contacts tab

**Tests:** CRUD for contacts endpoint, primary contact logic

---

### P2 — Could Have (Platform & Intelligence Layer)

#### 12. AI Enrichment — Company Data

**Why:** Clay's core value prop. Auto-populate `industry`, `employee_count`, `website`, `description` from company name/domain using a free enrichment source (Clearbit free tier or a self-hosted lookup against LinkedIn/Crunchbase public APIs).

**Backend:**
- `POST /api/v1/customers/{id}/enrich` — triggers async enrichment job
- Enrichment service calls Clearbit Enrichment API (key from env) or fallback to web scrape
- Writes back to `Customer` record; logs Activity of type `enrichment`
- Returns `{enriched_fields: [...], status: "completed" | "no_data"}`

**Frontend:**
- "Enrich" button on Customer detail page (shown when `company` is set)
- Loading spinner while enrichment runs
- Toast on completion: "3 fields updated"

**Files:**
- `backend/app/services/enrichment_service.py`
- `backend/app/api/v1/customers.py` — add enrich endpoint
- `frontend/src/app/customers/[id]/page.tsx` — enrich button

---

#### 13. Multi-User Auth (JWT)

**Why:** Any team use-case requires auth. Foundation for RBAC, audit attribution, and multi-tenancy.

**Backend:**
- `User` model: `id`, `email`, `hashed_password`, `role` (`admin` | `member`), `created_at`
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login` → returns JWT
- `GET /api/v1/auth/me`
- All CUD endpoints require `Authorization: Bearer <token>` (FastAPI `Depends(get_current_user)`)
- Passwords: `passlib[bcrypt]`
- JWT: `python-jose`
- Alembic migration for `users` table

**Frontend:**
- `/login` page — email + password form
- JWT stored in `httpOnly` cookie (via Next.js API route proxy) or localStorage
- Nav shows current user email + logout button
- Unauthenticated requests redirect to `/login`

**Files:**
- `backend/app/models/user.py`
- `backend/app/core/auth.py` — JWT helpers, `get_current_user`
- `backend/app/api/v1/auth.py`
- `backend/alembic/versions/` — migration
- `frontend/src/app/login/page.tsx`
- `frontend/src/lib/auth.ts`

---

#### 14. Role-Based Access Control (RBAC)

**Why:** After auth, teams immediately need: admins can delete; members can only create/read. Foundational for enterprise CRM.

**Backend:**
- `admin`: full CRUD on all resources + settings
- `member`: create + read + update own records; no delete; no webhooks/settings

**Frontend:**
- Hide delete buttons and settings nav for `member` role
- Role shown in user profile

**Files:**
- `backend/app/core/auth.py` — `require_role()` dependency
- All v1 routers — add role guards to DELETE endpoints

---

#### 15. Pipeline Revenue Forecast

**Why:** "What will we close this quarter?" — the most-asked sales leadership question. Builds on `probability` + `expected_close_date` already in the data model.

**Backend:**
- `GET /api/v1/forecast?period=current_quarter|next_quarter|custom&from=&to=`
- Returns: `{weighted_pipeline: float, best_case: float, commit: float, deals: [...]}`
- `weighted_pipeline` = Σ(value × probability/100) for open deals closing in period
- `commit` = Σ value where stage = negotiation and probability ≥ 80
- `best_case` = Σ value for all open deals in period

**Frontend:**
- Forecast card on Dashboard (below current summary cards)
- Three metric columns: Weighted / Commit / Best Case
- Period selector matching Dashboard date range

**Files:**
- `backend/app/api/v1/forecast.py` — new router
- `frontend/src/app/page.tsx` — forecast section

---

## Implementation Priority

1. **Kanban Pipeline Board** (#1) — drives daily usage and adoption
2. **Global Search** (#2) — usability baseline for any real dataset
3. **Notes** (#3) — prevents reps from abandoning the CRM
4. **Activity Task Queue** (#4) — closes the "what do I do today" loop
5. **Customer Status Lifecycle** (#5) — enables funnel analytics
6. **AI Deal Health Score** (#6) — first intelligence feature, no external deps
7. **Audit Log** (#7) — compliance and trust signal
8. **Outbound Webhooks** (#8) — unlocks integrations ecosystem
9. **CSV Import/Export** (#9) — migration and data-ops blocker
10. **Dashboard Date Range** (#10) — management reporting
11. **Contacts Model** (#11) — data model correctness
12. **AI Enrichment** (#12) — growth/intelligence
13. **Auth + RBAC** (#13, #14) — multi-user teams
14. **Forecast** (#15) — revenue ops

---

## Architecture Notes for Scaling

- **No mock data ever.** All features backed by real DB from day one.
- **Async everything.** All new repositories and services use `async/await`.
- **Background tasks** for slow operations (webhooks, enrichment) via FastAPI `BackgroundTasks`.
- **Pagination required.** All list endpoints must accept `limit` + `offset`. Frontend must pass real pagination params.
- **Tenant-ready schema.** When Auth ships, all models get a `user_id` or `team_id` FK for future multi-tenancy (add column via migration, don't rewrite models).
- **No new frontend dependencies** without a strong reason. Existing: Tailwind, shadcn/ui, Next.js. Drag-and-drop uses native HTML5 API.
