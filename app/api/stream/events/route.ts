import { subscribe } from "@/lib/stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-sent events: replaces the old aiohttp WebSocket (Next route handlers can't upgrade).
export function GET(req: Request) {
  const enc = new TextEncoder();
  let off = () => {};
  let beat: NodeJS.Timeout;
  const stream = new ReadableStream({
    start(ctl) {
      off = subscribe((m) => ctl.enqueue(enc.encode(`data: ${JSON.stringify(m)}\n\n`)));
      beat = setInterval(() => ctl.enqueue(enc.encode(": ping\n\n")), 15000);
      req.signal.addEventListener("abort", () => {
        off();
        clearInterval(beat);
        try { ctl.close(); } catch {}
      });
    },
    cancel() {
      off();
      clearInterval(beat);
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
