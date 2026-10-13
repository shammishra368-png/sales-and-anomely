import type { CSSProperties, ReactNode, RefObject } from "react";

export interface GlassSurfaceProps {
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B" | "A";
  yChannel?: "R" | "G" | "B" | "A";
  mixBlendMode?: string;
  refraction?: boolean;
  renderer?: "auto" | "webgl" | "svg";
  backdrop?: RefObject<HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null> | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
  shape?: string;
  className?: string;
  style?: CSSProperties;
}

declare const GlassSurface: (props: GlassSurfaceProps) => JSX.Element;
export default GlassSurface;
