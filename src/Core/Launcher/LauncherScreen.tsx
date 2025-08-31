/* ============================================================
   IMPORT SECTION
   ============================================================ */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

/* ============================================================
   TYPES SECTION
   ============================================================ */
type Props = {};
export type OriginState = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  scale: number; // 0.5 * min(width, height) scale for normalized mapping [-1..1]
};
export type Norm = { x: number; y: number };

/* ============================================================
   STATE SECTION
   ============================================================ */
// Small config constants
export const OVERLAY_ID = "overlay-root";         /* overlay container id used by portals */
export const ORIGIN_DOT = 6;                       /* center dot size in px */

// Context for publishing origin data to external components
const OriginContext = createContext<OriginState | null>(null);

export function useOrigin(): OriginState {
  const v = useContext(OriginContext);
  if (!v) throw new Error("useOrigin must be used within <OriginProvider>");
  return v;
}
function OriginProvider({ value, children }: { value: OriginState; children: React.ReactNode }) {
  return <OriginContext.Provider value={value}>{children}</OriginContext.Provider>;
}

// Observe container size (ResizeObserver)
function useSize(el: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setSize({ width: cr.width, height: cr.height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [el]);
  return size;
}

/* ============================================================
   LOGIC SECTION
   ============================================================ */
// Compute origin at screen center and a safe scale value
function useOriginState(size: { width: number; height: number }): OriginState {
  return useMemo(() => {
    const { width, height } = size;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 0.5 * Math.min(width, height);
    return { width, height, centerX, centerY, scale };
  }, [size]);
}

// Mapping helpers
export function mapToPx(o: OriginState, n: Norm) {
  const left = o.centerX + n.x * o.scale;  /* X increases to the right */
  const top  = o.centerY - n.y * o.scale;  /* Y increases upward (screen Y inverted) */
  return { left, top };
}
export function pxToNorm(o: OriginState, p: { left: number; top: number }): Norm {
  const x = (p.left - o.centerX) / o.scale;
  const y = (o.centerY - p.top) / o.scale;
  return { x, y };
}

/* ============================================================
   UI SECTION
   ============================================================ */
export default function LauncherScreen(_: Props) {
  const ref = useRef<HTMLDivElement | null>(null); // main container ref
  const size = useSize(ref);                       // live width/height
  const origin = useOriginState(size);             // center & scale based on size

  return (
    <div
      ref={ref}
      className="relative w-full h-screen bg-gray-900" /* background color is set here -> change bg-gray-900 as needed */
    >
      <OriginProvider value={origin}>
        {/* ORIGIN DOT (visible center marker) */}
        <div
          className="absolute z-10 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow"
          style={{ width: ORIGIN_DOT, height: ORIGIN_DOT, backgroundColor: "#d63131ff" }} /* change color/size if needed */
          aria-label="origin marker"
        />

        {/* OVERLAY ROOT: external layers should portal into this element */}
        <div
          id={OVERLAY_ID}
          className="pointer-events-none absolute inset-0 z-50"
          /* interactive children must set pointer-events-auto on themselves */
        />
      </OriginProvider>
    </div>
  );
}

/* ============================================================
   STYLES SECTION
   ============================================================ */
// All styling uses Tailwind utility classes on elements; keep config-driven where possible.
