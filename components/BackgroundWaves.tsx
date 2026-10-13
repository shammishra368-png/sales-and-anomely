"use client";

import { useEffect, useState } from "react";
import GradientWaves from "./GradientWaves";

/** Fixed full-viewport backdrop using the exact GradientWaves props requested. */
export default function BackgroundWaves() {
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);

    // The canvas sits behind the UI, so forward window pointer moves to it to keep cursor parallax alive.
    const onMove = (e: PointerEvent) =>
      document.querySelector<HTMLCanvasElement>("#waves canvas")?.dispatchEvent(
        new PointerEvent("pointermove", { clientX: e.clientX, clientY: e.clientY }),
      );
    window.addEventListener("pointermove", onMove);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div id="waves" aria-hidden className="fixed inset-0 -z-10 bg-[#0b0620]" style={{ width: "100%", height: "100%" }}>
      <GradientWaves
        horizonColor="#5227FF"
        waveColor="#FF9FFC"
        crestColor="#FFFFFF"
        speed={still ? 0 : 1.25}
        amplitude={3.4}
        waveScale={0.85}
        waveRatio={0.5}
        swell={35}
        turbulence={30.5}
        tilt={1.11}
        zoom={1.25}
        height={7}
        fogDepth={21}
        detail="medium"
        brightness={1.3}
        opacity={1}
        mouseInteraction
        parallaxStrength={0.74}
        grain
        grainIntensity={0.05}
      />
    </div>
  );
}
