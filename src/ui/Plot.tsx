/**
 * Shared plot chrome. Ruled axes, drawn paths, no gradient fills.
 * Series colour comes from brass and ink only.
 */
import React from 'react';

export interface Pt { x: number; y: number }

export function scaleTo(points: Pt[], w: number, h: number, pad = 0) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const padY = (y1 - y0) * 0.12 || 1;
  const sx = (x: number) => pad + ((x - x0) / (x1 - x0 || 1)) * (w - pad * 2);
  const sy = (y: number) => h - (pad + ((y - (y0 - padY)) / ((y1 + padY) - (y0 - padY) || 1)) * (h - pad * 2));
  return { sx, sy, x0, x1, y0: y0 - padY, y1: y1 + padY };
}

export function path(points: Pt[], sx: (n: number) => number, sy: (n: number) => number) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ');
}

/** Drawn line. Length is estimated so the dash animation reads correctly. */
export function DrawnPath({
  d, stroke, width = 1.5, dashed = false, delay = 0,
}: { d: string; stroke: string; width?: number; dashed?: boolean; delay?: number }) {
  const ref = React.useRef<SVGPathElement>(null);
  const [len, setLen] = React.useState(2000);
  React.useEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength());
  }, [d]);
  return (
    <path
      ref={ref}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeDasharray={dashed ? '4 3' : undefined}
      className={dashed ? undefined : 'draw-path'}
      style={dashed ? undefined : { ['--len' as string]: len, animationDelay: `${delay}ms` }}
    />
  );
}

export function Axes({ w, h, pad = 0 }: { w: number; h: number; pad?: number }) {
  return (
    <g aria-hidden="true">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--rule-strong)" strokeWidth="1" />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="var(--rule-strong)" strokeWidth="1" />
    </g>
  );
}

export function GridLines({ w, h, pad = 0, rows = 4 }: { w: number; h: number; pad?: number; rows?: number }) {
  return (
    <g aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => {
        const y = pad + ((h - pad * 2) / rows) * (i + 1);
        return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="var(--rule-hair)" strokeWidth="1" />;
      })}
    </g>
  );
}
