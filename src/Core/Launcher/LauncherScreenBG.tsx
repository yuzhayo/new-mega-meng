/* ============================================================
   IMPORT SECTION
   ============================================================ */
import React, { useEffect, useMemo, useState } from "react";
import type { OriginState } from "./LauncherScreen";
import LauncherScreenBGEffect, { LayerEffect, type LayerEffects } from "./LauncherScreenBGEffect";

/* ============================================================
   TYPES SECTION
   ============================================================ */
export type BGLayer = {
  src?: string;                          /* full path asset (under public), ex: "/Asset/BG/BG1.png" */
  alt?: string;
  visible?: boolean;                     /* default true kalau ada src */
  opacity?: number;                      /* legacy shortcut 0..1 */
  fit?: "fill" | "contain" | "cover";    /* default "fill" */
  effects?: LayerEffects;                /* efek per-layer */
};

export type LauncherScreenBGProps = {
  origin: OriginState;
  layers?: BGLayer[];                    /* inline layers (optional) */
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
    const effects = { ...(L.effects ?? {}) };
    if (typeof L.opacity === "number" && typeof effects.opacity !== "number") {
      effects.opacity = L.opacity;
    }
    return { ...L, visible, effects };
  });
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
      {/* Global placeholder effect (boleh dihapus kalau gak perlu) */}
      <LauncherScreenBGEffect origin={origin} />

      {/* Layer dinamis, ditumpuk berdasar index */}
      {effective.map((L, i) => {
        if (!L.visible || !L.src) return null;
        const src = resolvePublicPath(L.src);
        return (
          <div key={i} className="absolute inset-0" style={{ zIndex: i }}>
            <LayerEffect
              src={src}
              alt={L.alt ?? `bg-layer-${i + 1}`}
              fit={L.fit}
              effects={L.effects}
              origin={origin}  /* penting untuk posPct */
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
// Index kecil = paling bawah. Semua non-interaktif, jadi gesture tetap tembus.
