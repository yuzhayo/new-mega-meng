/* ============================================================
   IMPORT SECTION
   ============================================================ */
import React, { useCallback, useRef, useState } from "react";

/* ============================================================
   TYPES SECTION
   ============================================================ */
export type TripleTapOptions = {
  windowMs?: number;     // time window to collect taps (ms)
  radiusPx?: number;     // max distance among taps to count as same area (px)
};
type Point = { x: number; y: number };

/* ============================================================
   STATE SECTION
   ============================================================ */
// none

/* ============================================================
   LOGIC SECTION
   ============================================================ */
function dist(a: Point, b: Point) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/** Hook: triple-tap anywhere toggles a boolean flag (show/hide). */
export function useTripleTapToggle(opts: TripleTapOptions = {}) {
  const windowMs = opts.windowMs ?? 450;   /* 3 taps must occur within 450ms */
  const radiusPx = opts.radiusPx ?? 48;    /* taps must be within 48px radius */

  const [show, setShow] = useState(false);
  const taps = useRef<{ t: number; p: Point }[]>([]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const now = performance.now();
    const p = { x: e.clientX, y: e.clientY };

    // keep taps in the time window
    taps.current = taps.current.filter(entry => now - entry.t <= windowMs);
    taps.current.push({ t: now, p });

    // spatial consistency check
    const first = taps.current[0]?.p;
    const okRadius = first ? taps.current.every(entry => dist(entry.p, first) <= radiusPx) : true;

    if (okRadius && taps.current.length >= 3) {
      setShow(prev => !prev);       /* toggle show/hide */
      taps.current = [];            /* reset after toggle */
    }
  }, [windowMs, radiusPx]);

  return { show, onPointerDown, setShow };
}

/* ============================================================
   UI SECTION
   ============================================================ */
/** Full-screen invisible layer to capture triple-tap gestures. */
export function GestureLayer(props: { onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <div
      className="absolute inset-0 z-40 pointer-events-auto"
      onPointerDown={props.onPointerDown} /* triple-tap detection handler */
      aria-hidden="true"                   /* purely behavioral, no semantics */
    />
  );
}

/* ============================================================
   STYLES SECTION
   ============================================================ */
// Styling via Tailwind classes in components above.
