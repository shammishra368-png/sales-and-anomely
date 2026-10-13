// Web Audio alerts: urgent double beep for CRITICAL, soft chime for WARNING.
let ctx: AudioContext | null = null;

function tone(type: OscillatorType, f0: number, f1: number, at: number, len: number, vol: number) {
  const o = ctx!.createOscillator();
  const g = ctx!.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, at);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + len);
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.01, at + len);
  o.connect(g).connect(ctx!.destination);
  o.start(at);
  o.stop(at + len);
}

export function playAlert(severity: string) {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    if (severity === "CRITICAL") {
      tone("sawtooth", 880, 880, t, 0.15, 0.12);
      tone("sawtooth", 1046.5, 1046.5, t + 0.18, 0.2, 0.15);
    } else tone("sine", 587.33, 659.25, t, 0.3, 0.1);
  } catch {}
}
