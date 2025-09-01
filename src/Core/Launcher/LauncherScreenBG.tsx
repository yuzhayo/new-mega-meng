/* ============================================================
   IMPORT SECTION
   ============================================================ */
import React, { useEffect, useMemo, useState } from "react";
import type { OriginState } from "./LauncherScreen";

/* ============================================================
   TYPES SECTION
   ============================================================ */
export type BGLayer = {
  /** path asset di public, ex: "/Asset/BG/BG1.png" */
  src?: string;
  alt?: string;
  visible?: boolean;                     /* default true kalau ada src */
  /**
   * cover | contain | fill | none
   * - cover/contain/fill: gambar full-screen mengikuti object-fit
   * - none: pakai ukuran natural image, di-center ke dotmark
   */
  fit?: "cover" | "contain" | "fill" | "none";
  /** skala proporsional dalam persen; 100 = original */
  scalePct?: number;
  /**
   * posisi relatif dotmark dalam persen dari origin.scale
   * x ke kanan positif; y ke atas positif
   */
  posPct?: { x: number; y: number };
};

export type LauncherScreenBGProps = {
  origin: OriginState;
  layers?: BGLayer[];                    /* inline (opsional) */
  manifestPath?: string;                 /* ex: "/launcher-bg.json" */
};

/* ============================================================
   STATE SECTION
   ============================================================ */
type Manifest = { layers?: BGLayer[] };
const EMPTY: BGLayer[] = [];

/* ============================================================
   LOGIC SECTION
   ============================================================ */
function resolvePublicPath(p?: string) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;                      // absolute URL
  const base = (import.meta as any).env?.BASE_URL ?? "/";     // Vite base
  const clean = p.startsWith("/") ? p.slice(1) : p;           // drop leading slash
  return `${base}${clean}`;                                   // single slash join
}

function normalize(layers?: BGLayer[]) {
  if (!layers) return EMPTY;
  return layers.map(L => {
    if (!L) return { visible: false } as BGLayer;
    const visible = L.visible ?? Boolean(L.src);
    const fit: BGLayer["fit"] = L.fit ?? "none";
    const scalePct = typeof L.scalePct === "number" ? L.scalePct : 100;
    const posPct = L.posPct ?? { x: 0, y: 0 };
    return { ...L, visible, fit, scalePct, posPct };
  });
}

function toObjectFitClass(fit: NonNullable<BGLayer["fit"]>) {
  if (fit === "cover") return "object-cover";
  if (fit === "contain") return "object-contain";
  if (fit === "fill") return "object-fill";
  return ""; // none
}

/** hitung offset pixel dari dotmark berdasarkan persen origin.scale */
function offsetFromOrigin(origin: OriginState, posPct: { x: number; y: number }) {
  const unit = origin.scale;               // 1.0 unit normalisasi = origin.scale px
  const dx = (posPct.x / 100) * unit;      // kanan positif
  const dy = (posPct.y / 100) * unit;      // atas positif
  return { dx, dy: -dy };                   // CSS Y kebawah positif, jadi balik
}

/** compose transform akhir untuk layer */
function composeTransform(origin: OriginState, fit: BGLayer["fit"], scalePct: number, posPct: { x: number; y: number }) {
  const { dx, dy } = offsetFromOrigin(origin, posPct);
  const s = (scalePct || 100) / 100;
  const parts: string[] = [];
  // centering default: hanya untuk fit "none" (natural size)
  if (fit === "none") parts.push("translate(-50%, -50%)");
  // offset relatif dotmark
  if (dx !== 0 || dy !== 0) parts.push(`translate(${dx}px, ${dy}px)`);
  // scaling proporsional
  if (s !== 1) parts.push(`scale(${s})`);
  return parts.length ? parts.join(" ") : undefined;
}

/* ============================================================
   UI SECTION
   ============================================================ */
export default function LauncherScreenBG({ origin, layers, manifestPath }: LauncherScreenBGProps) {
  const [manifestLayers, setManifestLayers] = useState<BGLayer[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!manifestPath) {
      setManifestLayers(null);
      return;
    }
    const url = resolvePublicPath(manifestPath);
    fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject(`${r.status} ${r.statusText}`)))
      .then((json: Manifest) => {
        if (!cancelled) {
          const arr = Array.isArray(json?.layers) ? json.layers : EMPTY;
          setManifestLayers(arr);
        }
      })
      .catch(err => {
        console.warn("[BG] manifest load failed:", url, err);
        if (!cancelled) setManifestLayers(EMPTY);
      });
    return () => { cancelled = true; };
  }, [manifestPath]);

  const effective = useMemo(() => normalize(manifestLayers ?? layers ?? EMPTY), [manifestLayers, layers]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      {effective.map((L, i) => {
        if (!L.visible || !L.src) return null;
        const src = resolvePublicPath(L.src);
        const fitClass = toObjectFitClass(L.fit!);
        const transform = composeTransform(origin, L.fit!, L.scalePct!, L.posPct!);
        return (
          <div key={i} className="absolute inset-0" style={{ zIndex: i }}>
            <img
              src={src}
              alt={L.alt ?? `bg-layer-${i + 1}`}
              draggable={false}
              aria-hidden="true"
              onError={() => console.warn("[BG] failed to load", src)}
              style={{
                transform,
                transformOrigin: "center center"
              }}
              className={
                L.fit === "none"
                  ? `absolute left-1/2 top-1/2 ${fitClass}`
                  : `absolute inset-0 w-full h-full ${fitClass}`
              }
            />
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   STYLES SECTION
   ============================================================ */
// Index kecil = paling bawah. Semua layer non-interaktif. Gesture aman.
