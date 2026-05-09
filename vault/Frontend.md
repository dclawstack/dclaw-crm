# Frontend

Next.js 14 application using the App Router and Tailwind CSS with shadcn/ui components.

## Entry Points

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Dashboard home — summary cards |
| `src/app/layout.tsx` | Root layout — nav, global styles |
| `src/app/customers/page.tsx` | Customer list |
| `src/app/customers/[id]/page.tsx` | Customer detail |
| `src/app/deals/page.tsx` | Deals list |
| `src/app/deals/[id]/page.tsx` | Deal detail |
| `src/app/activities/page.tsx` | Activity log |

## API Client

`src/lib/api.ts` — typed fetch wrappers for all backend endpoints. Base URL is configured via `NEXT_PUBLIC_API_URL` env var.

## UI Components

All components in `src/components/ui/` are custom shadcn/ui v3-compatible implementations built on Tailwind. Do **not** replace these with the shadcn CLI — they've been manually adapted for compatibility.

| Component | Usage |
|-----------|-------|
| `badge.tsx` | Status pills |
| `button.tsx` | Actions |
| `card.tsx` | Dashboard cards |
| `dialog.tsx` | Create/edit modals |
| `input.tsx` | Form fields |
| `label.tsx` | Form labels |
| `select.tsx` | Dropdowns |
| `table.tsx` | Data tables |
| `tabs.tsx` | Tab navigation |

## Dev

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
npm run build
npm run lint
```

## Related Notes

- [[Directory-Structure]]
- [[API-Reference]]
