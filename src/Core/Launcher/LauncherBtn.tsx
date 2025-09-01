/* ============================================================
   IMPORT SECTION
   ============================================================ */
import React from "react";

/* ============================================================
   UI SECTION
   ============================================================ */
export default function LauncherBtn() {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 px-4 py-4 rounded-2xl shadow text-sm select-none
                 bg-neutral-200/90 dark:bg-neutral-800/90
                 pointer-events-auto z-50"
      /* centered placeholder; click-through enabled */
    >
      LauncherBtn
    </div>
  );
}
