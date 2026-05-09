# Roadmap v1.2

Full spec lives in `PLAN-v1.2.md` at the project root. This is the quick-reference summary.

## Design System (Strict Light Mode)

| Role | Tailwind Class |
|------|---------------|
| Page background | `bg-background` (white) |
| All text | `text-foreground` (dark navy) |
| Primary buttons / active | `bg-primary text-primary-foreground` |
| Secondary / badges | `bg-secondary text-secondary-foreground` |
| Helper text / timestamps | `text-muted-foreground` |
| Borders everywhere | `border-border` |
| Danger / delete | `bg-destructive text-destructive-foreground` |
| Border radius | `rounded-lg` (cards), `rounded-md` (inputs) |

**No dark mode. No hardcoded hex. No `dark:` variants.**

## Feature Queue (in order)

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 1 | Kanban Pipeline Board | P0 | — |
| 2 | Global Search (`Cmd+K`) | P0 | — |
| 3 | Notes on Customers & Deals | P0 | — |
| 4 | Activity Task Queue (due today / overdue) | P0 | — |
| 5 | Customer Status Lifecycle (lead→prospect→customer→churned) | P0 | — |
| 6 | AI Deal Health Score (heuristic, 0–100) | P1 | — |
| 7 | Audit Log | P1 | — |
| 8 | Outbound Webhooks (HMAC signed, retried) | P1 | — |
| 9 | CSV Import / Export | P1 | — |
| 10 | Dashboard Date Range Filter | P1 | — |
| 11 | Contacts (people inside companies) | P1 | — |
| 12 | AI Enrichment (company data auto-fill) | P2 | — |
| 13 | Multi-User Auth (JWT) | P2 | — |
| 14 | RBAC (admin / member roles) | P2 | — |
| 15 | Pipeline Revenue Forecast | P2 | — |

## v1.0 Shipped

- [x] Customer CRUD
- [x] Deal CRUD (stages, probability, expected close date)
- [x] Activity log
- [x] Dashboard (pipeline, win rate, recent activities)
- [x] Docker + Helm
- [x] Alembic migrations
- [x] Backend tests

## Analysis Basis

Benchmarked against: **Attio**, **Twenty (YC S23)**, **Clay**, **Folk**, **item (YC)**, **Relate**, **Clarify**.

Key gaps addressed vs. basic CRMs:
- No visual pipeline → Kanban (#1)
- No search → Global Search (#2)
- No note-taking → Notes (#3)
- No task view → Task Queue (#4)
- No audit trail → Audit Log (#7)
- No integrations API → Webhooks (#8)
- No data migration path → CSV (#9)

## Related Notes

- [[Directory-Structure]]
- [[Backend]]
- [[Frontend]]
- [[API-Reference]]
