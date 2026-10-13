// Proves the Supabase view == legacy SQLite view, row for row.
// Run: npm run parity   (needs .env.local; reads legacy/retail.db)
import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const lite = new DatabaseSync("legacy/retail.db", { readOnly: true }).prepare("select * from zscore_live_view order by id").all();

const pg = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("zscore_live_view").select("*").order("id").range(from, from + 999);
  if (error) throw new Error(error.message);
  pg.push(...data);
  if (data.length < 1000) break;
}

let diffs = 0;
for (const [i, a] of lite.entries()) {
  const b = pg[i];
  for (const k of Object.keys(a)) if (a[k] !== b?.[k]) { diffs++; if (diffs <= 10) console.log("DIFF", a.id, k, a[k], b?.[k]); }
}
console.log(`sqlite=${lite.length} supabase=${pg.length} diffs=${diffs}`);
process.exit(diffs || lite.length !== pg.length ? 1 : 0);
