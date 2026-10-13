import { snapshot } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const n = Number(new URL(req.url).searchParams.get("limit"));
  try {
    return Response.json(await snapshot(Number.isInteger(n) && n > 0 ? Math.min(n, 5000) : 500));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
