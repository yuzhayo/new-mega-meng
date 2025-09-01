/* ============================================================
   IMPORT SECTION
   ============================================================ */
import React, { useMemo } from "react";
import type { OriginState } from "./LauncherScreen";

/* ============================================================
   EFFECT TYPES SECTION
   ============================================================ */
export type LayerEffects = {
  blurPx?: number;
  brightness?: number;   /* 0..2 */
  contrast?: number;     /* 0..2 */
  grayscale?: number;    /* 0..1 */
  sepia?: number;        /* 0..1 */
  saturate?: number;     /* 0..3 */
  hueRotateDeg?: number; /* deg */
  opacity?: number;      /* 0..1 */
  blendMode?: React.CSSProperties["mixBlendMode"];
  tintColor?: string;
  tintOpacity?: number;  /* 0..1 */
  scale?: number;
  rotateDeg?: number;
  translateX?: string;   /* "0px" | "2%" */
  translateY?: string;   /* "0px" | "-1%" */
  /** Scale dalam persen, 100 = original, >100 membesar, <100 mengecil */
  scalePct?: number;
  /** Posisi relatif dari dotmark: persen dari origin.scale. X kanan +, Y atas + */
  posPct?: { x: number; y: number };
};

export type LayerVisualProps = {
  src: string;
  alt?: string;
  fit?: "fill" | "contain" | "cover";
  effects?: LayerEffects;
  /** Origin dibutuhkan untuk menghitung offset posPct */
  origin?: OriginState;
};

/* ============================================================
   EFFECT UTILS SECTION
   ============================================================ */
function fitClass(fit?: "fill" | "contain" | "cover") {
  if (fit === "contain") return "object-contain";
  if (fit === "cover") return "object-cover";
  return "object-fill";
}

function sizeClass(fit?: "fill" | "contain" | "cover") {
  // Kalau pakai fit (cover/contain/fill), pakai w-full h-full.
  // Kalau tidak, biarkan natural size (tanpa w/h), tetap di-center.
  return fit ? "w-full h-full" : "";
}

function toFilterCss(e?: LayerEffects) {
  if (!e) return undefined;
  const parts: string[] = [];
  if (e.blurPx && e.blurPx > 0) parts.push(`blur(${e.blurPx}px)`);
  if (typeof e.brightness === "number") parts.push(`brightness(${e.brightness})`);
  if (typeof e.contrast === "number") parts.push(`contrast(${e.contrast})`);
  if (typeof e.grayscale === "number") parts.push(`grayscale(${e.grayscale})`);
  if (typeof e.sepia === "number") parts.push(`sepia(${e.sepia})`);
  if (typeof e.saturate === "number") parts.push(`saturate(${e.saturate})`);
  if (typeof e.hueRotateDeg === "number") parts.push(`hue-rotate(${e.hueRotateDeg}deg)`);
  return parts.length ? parts.join(" ") : undefined;
}

function originOffsetPx(origin: OriginState | undefined, pos?: { x: number; y: number }) {
  if (!origin || !pos) return { dx: 0, dy: 0 };
  const unit = origin.scale;        // 1.0 unit normalisasi = origin.scale px
  const dx = (pos.x / 100) * unit;  // kanan positif
  const dy = (pos.y / 100) * unit;  // atas positif
  return { dx, dy };
}

function composeTransform(origin: OriginState | undefined, e?: LayerEffects) {
  if (!e) return undefined;
  const { dx, dy } = originOffsetPx(origin, e.posPct);
  const baseTx = e.translateX ?? "0";
  const baseTy = e.translateY ?? "0";
  // CSS screen Y ke bawah positif, mapping kita Y ke atas positif → balik tanda
  const tpx = dx === 0 ? "0px" : `${dx}px`;
  const tpy = dy === 0 ? "0px" : `${-dy}px`;
  const rot = typeof e.rotateDeg === "number" ? e.rotateDeg : 0;
  const sPct = typeof e.scalePct === "number" ? e.scalePct / 100 : 1;
  const sMul = typeof e.scale === "number" ? e.scale : 1;
  const scale = sPct * sMul;
  const parts = [
    `translate(${tpx}, ${tpy})`,
    (baseTx !== "0" || baseTy !== "0") ? `translate(${baseTx}, ${baseTy})` : null,
    rot !== 0 ? `rotate(${rot}deg)` : null,
    scale !== 1 ? `scale(${scale})` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : undefined;
}

/* ============================================================
   LAYER EFFECT COMPONENT SECTION
   ============================================================ */
export function LayerEffect({ src, alt, fit, effects, origin }: LayerVisualProps) {
  const { overlayStyle, imgStyle } = useMemo(() => {
    const filter = toFilterCss(effects);
    // Base centering ke dotmark: translate(-50%, -50%) dari left/top 50%
    const composed = composeTransform(origin, effects);
    const transform = composed ? `translate(-50%, -50%) ${composed}` : `translate(-50%, -50%)`;

    const imgStyle: React.CSSProperties = {
      filter,
      transform,
      transformOrigin: "center center",
      opacity: typeof effects?.opacity === "number" ? effects?.opacity : undefined,
      mixBlendMode: effects?.blendMode,
    };

    const overlayStyle: React.CSSProperties | undefined =
      effects?.tintColor && typeof effects?.tintOpacity === "number"
        ? {
            backgroundColor: effects.tintColor,
            opacity: effects.tintOpacity,
            mixBlendMode: effects.blendMode,
          }
        : undefined;

    return { overlayStyle, imgStyle };
  }, [effects, origin?.width, origin?.height, origin?.centerX, origin?.centerY]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <img
        src={src}
        alt={alt ?? "bg-layer"}
        // Center absolut di dotmark; kalau pakai fit, gambar full-screen tapi tetap center.
        className={`absolute left-1/2 top-1/2 ${sizeClass(fit)} ${fitClass(fit)}`}
        style={imgStyle}
        draggable={false}
        aria-hidden="true"
        onError={() => console.warn("[BG] failed to load", src)}
      />
      {overlayStyle && <div className="absolute inset-0" style={overlayStyle} aria-hidden="true" />}
    </div>
  );
}

/* ============================================================
   BG EFFECT (GLOBAL) SECTION
   ============================================================ */
export default function LauncherScreenBGEffect({ origin }: { origin: OriginState }) {
  // Placeholder: radial glow lembut di pusat origin
  const w = origin.width || 1;
  const h = origin.height || 1;
  const cx = (origin.centerX / w) * 100;
  const cy = (origin.centerY / h) * 100;

  const style: React.CSSProperties = {
    backgroundImage: `radial-gradient(circle at ${cx}% ${cy}%, rgba(255,255,255,0.08), rgba(0,0,0,0) 60%)`,
  };

  return <div className="absolute inset-0 z-0 pointer-events-none select-none" style={style} aria-hidden="true" />;
}

/* ============================================================
   STYLES SECTION
   ============================================================ */
// Semua non-interaktif. Efek berbasis CSS filter + blend-mode (ringan).
