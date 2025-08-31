/* ============================================================
   IMPORT SECTION
   ============================================================ */
import React from "react";
import { createPortal } from "react-dom";
import { useOrigin } from "../Core/Launcher/OriginContext";
import { mapToPx } from "../Core/Launcher/map";

/* ============================================================
   TYPES SECTION
   ============================================================ */
type Props = {
  x?: number; // koordinat normalisasi [-1..1]
  y?: number; // koordinat normalisasi [-1..1]
};

/* ============================================================
   STATE SECTION
   ============================================================ */
// ora perlu

/* ============================================================
   LOGIC SECTION
   ============================================================ */
function useOverlayRoot() {
  const el = document.getElementById("overlay-root");
  if (!el) throw new Error("Overlay root not found. Pastikno LauncherScreen kebukak.");
  return el;
}

/* ============================================================
   UI SECTION
   ============================================================ */
export default function BtnSample({ x = 0.25, y = 0.1 }: Props) {
  const origin = useOrigin();
  const target = useOverlayRoot();
  const pos = mapToPx(origin, { x, y });

  const style: React.CSSProperties = {
    position: "absolute",
    left: pos.left,
    top: pos.top,
    transform: "translate(-50%, -50%)", /* center anchor nang titik mapping */
    pointerEvents: "auto" /* aktifno interaksi tombol */
  };

  return createPortal(
    <button
      style={style}
      className="px-3 py-1 rounded-2xl shadow text-sm bg-yellow-300 hover:bg-yellow-200 active:scale-95"
      /* styling tombol bebas, iki mung conto; ganti kelas iki sak karepmu */
      onClick={() => console.log("BtnSample clicked at norm:", { x, y })}
    >
      Sample Btn
    </button>,
    target
  );
}

/* ============================================================
   STYLES SECTION
   ============================================================ */
// ora perlu
