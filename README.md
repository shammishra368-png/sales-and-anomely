# Retail Anomaly Engine (Next.js 15 + Supabase)

Same dashboard as before, now backed by Supabase Postgres instead of local SQLite.
The Postgres z-score view matches the SQLite view exactly: 0 differences across all 1678 seed rows.

## Pages

| Route | What |
|---|---|
| `/` | Landing page: Aurora WebGL hero, features, how it works, detection rules, FAQ |
| `/dashboard` | Live dashboard (needs Supabase) |
| `/about` | Technical deep dive |

The landing page and `/about` need no database, so they work before Supabase is set up.

## Setup

**1. Create the project.** At [supabase.com](https://supabase.com) → New project. Save the database password.

**2. Create tables and view.** Dashboard → SQL Editor → New query. Paste all of `supabase/schema.sql` → Run.

**3. Load the data.** New query. Paste all of `supabase/seed.sql` (about 125 KB) → Run. Check:
```sql
select count(*) from zscore_live_view;   -- 1678
```
If the editor rejects the paste, use psql instead (Project Settings → Database → Connection string):
```bash
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" -f supabase/seed.sql
```

**4. Get the keys.** Project Settings → API. Copy the Project URL and the `service_role` secret key.

**5. Configure env.**
```bash
cp .env.example .env.local     # then fill in both values
```
The service-role key bypasses Row Level Security. It stays on the server: only `app/api/*` and `lib/*` use it, and there is no `NEXT_PUBLIC_` prefix. RLS is on with no policies, so the public anon key can read nothing.

**6. Run.**
```bash
npm install                    # Node >= 22.13
npm run parity                 # optional: Supabase view vs legacy/retail.db -> "diffs=0"
npm run dev                    # http://localhost:3000 (landing), /dashboard (live)
npm test                       # Isolation Forest checks
```

## Deploy to Vercel

1. Push the folder to GitHub, then Vercel → Add New → Project → import it.
2. Add env vars `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview).
3. Deploy.

**Known limit on Vercel.** The live stream keeps its timer, subscribers, and pause/speed state in server memory (`lib/stream.ts`). On serverless, each instance has its own copy, so Pause and Speed can miss the instance that serves the stream, and SSE connections are cut at the function time limit (the browser reconnects). The snapshot, Step, and Inject buttons work fine. For a fully reliable stream, either host with `npm start` on a long-running server (Railway, Fly, a VPS), or move the tick loop into the browser (call `POST /api/stream {action:"step"}` on a timer). That is a small change to `Dashboard.tsx`; ask if you want it.

## Layout

| Path | Purpose |
|---|---|
| `supabase/schema.sql` | `sales_data`, `anomaly_log`, `zscore_live_view` (window functions), RLS |
| `supabase/seed.sql` | 1678 rows exported from the old `retail.db` |
| `components/Aurora.jsx` | Hero background (WebGL2); `Aurora.d.ts` adds its types |
| `components/GlassSurface.jsx` | Glass component (SVG refraction in Chromium, frosted fallback elsewhere); `GlassSurface.d.ts` adds types |
| `components/site/*` | Floating glass nav, glass pill buttons (`GlassLink`), footer |
| `lib/db.ts` | Server-only supabase-js client |
| `lib/engine.ts` | Generator, view reads (paged 1000 rows), Isolation Forest scoring, anomaly log |
| `lib/stream.ts` | SSE broadcaster and controls |
| `app/api/*` | `GET /api/snapshot`, `GET /api/stream/events` (SSE), `POST /api/stream` |
| `data/ml_metrics.json` | Static ML metrics |
| `legacy/` | Old SQLite DB and view, kept only for `npm run parity` |
| `scripts/parity.mjs` | Row-by-row SQLite vs Supabase comparison |

Flagged anomalies are now written to the `anomaly_log` table (it replaces `logs/anomaly_log.csv`).
