import { control, type Control } from "@/lib/stream";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    return Response.json(await control((await req.json()) as Control));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
