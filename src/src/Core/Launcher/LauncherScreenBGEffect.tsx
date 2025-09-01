/* ============================================================
   LAUNCHER BG EFFECT — DISABLED
   ============================================================ */
import React from "react";
import type { OriginState } from "./LauncherScreen";

/**
 * BG effect dimatikan. Komponen ini dibiarkan ada supaya import lama
 * tidak meledak saat transisi. Tidak merender apa pun.
 */
export default function LauncherScreenBGEffect(_: { origin: OriginState }) {
  return null;
}
