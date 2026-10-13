import { step } from "./engine";
import type { AnomalyKind, StreamMsg } from "./types";

type Sub = (m: StreamMsg) => void;
const g = globalThis as unknown as {
  __stream?: { streaming: boolean; interval: number; subs: Set<Sub>; timer: NodeJS.Timeout | null };
};
const S = (g.__stream ??= { streaming: true, interval: 1.5, subs: new Set(), timer: null });

const emit = (m: StreamMsg) => S.subs.forEach((f) => f(m));
const status = (): StreamMsg => ({ type: "STREAM_STATUS", is_streaming: S.streaming, interval: S.interval });

// The generator only runs while a dashboard is connected, so the DB doesn't grow unattended.
function arm() {
  if (S.timer || !S.streaming || !S.subs.size) return;
  S.timer = setTimeout(async () => {
    S.timer = null;
    try {
      emit({ type: "LIVE_RECORD", ...(await step()) });
    } catch (e) {
      console.error("[stream]", e);
    }
    arm();
  }, S.interval * 1000);
}

function disarm() {
  if (S.timer) clearTimeout(S.timer);
  S.timer = null;
}

export function subscribe(f: Sub) {
  S.subs.add(f);
  f({ type: "HANDSHAKE", is_streaming: S.streaming, interval: S.interval });
  arm();
  return () => {
    S.subs.delete(f);
    if (!S.subs.size) disarm();
  };
}

export type Control =
  | { action: "start" | "pause" | "step" }
  | { action: "speed"; interval: number }
  | { action: "inject"; type: AnomalyKind; item?: string };

const KINDS = ["spike", "drop", "shrinkage", "stockout"];

export async function control(c: Control) {
  switch (c.action) {
    case "start":
    case "pause":
      S.streaming = c.action === "start";
      S.streaming ? arm() : disarm();
      emit(status());
      return status();
    case "speed": {
      const v = Number(c.interval);
      if (!Number.isFinite(v)) throw new Error("interval must be a number");
      S.interval = Math.max(0.2, Math.min(10, v));
      disarm();
      arm();
      emit({ type: "STREAM_SPEED", interval: S.interval });
      return status();
    }
    case "step":
      emit({ type: "LIVE_RECORD", ...(await step()) });
      return status();
    case "inject": {
      if (!KINDS.includes(c.type)) throw new Error(`type must be one of ${KINDS.join(", ")}`);
      emit({ type: "LIVE_RECORD", ...(await step(c.item || undefined, c.type)), injected: true });
      return status();
    }
    default:
      throw new Error("unknown action");
  }
}
