import React from 'react';
import { PLANET_SHORT, ZODIAC_SIGNS, type PlanetId } from '../engine/constants';
import type { DivisionalPlacement } from '../engine/ephemeris';

export type ChartStyle = 'north' | 'south' | 'east';

interface Props {
  title: string;
  ascendantSignIndex: number;
  placements: DivisionalPlacement[];
  styleType: ChartStyle;
}

// Helper to group planet short codes by house (1..12) or by sign (0..11)
function getItemsByHouse(placements: DivisionalPlacement[]) {
  const map: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) map[h] = [];
  for (const p of placements) {
    if (p.id === 'Ascendant') continue;
    map[p.house]?.push(PLANET_SHORT[p.id as PlanetId]);
  }
  return map;
}

function getItemsBySign(placements: DivisionalPlacement[]) {
  const map: Record<number, string[]> = {};
  for (let s = 0; s < 12; s++) map[s] = [];
  for (const p of placements) {
    const label = p.id === 'Ascendant' ? 'Asc' : PLANET_SHORT[p.id as PlanetId];
    map[p.signIndex]?.push(label);
  }
  return map;
}

export const KundliChartSvg: React.FC<Props> = ({
  title,
  ascendantSignIndex,
  placements,
  styleType,
}) => {
  const byHouse = getItemsByHouse(placements);
  const bySign = getItemsBySign(placements);

  const signForHouse = (h: number) => ((ascendantSignIndex + h - 1) % 12) + 1;

  if (styleType === 'north') {
    // Classic North Indian Diamond Kundli (Houses fixed, Sign numbers rotate)
    const houseCoords: Record<number, { x: number; y: number }> = {
      1: { x: 180, y: 88 },
      2: { x: 95, y: 42 },
      3: { x: 42, y: 95 },
      4: { x: 92, y: 180 },
      5: { x: 42, y: 265 },
      6: { x: 95, y: 318 },
      7: { x: 180, y: 272 },
      8: { x: 265, y: 318 },
      9: { x: 318, y: 265 },
      10: { x: 268, y: 180 },
      11: { x: 318, y: 95 },
      12: { x: 265, y: 42 },
    };

    return (
      <div className="w-full max-w-[380px] mx-auto">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 text-center">
          {title} · North Indian
        </p>
        <svg viewBox="0 0 360 360" className="w-full h-auto border border-amber-500/40 rounded-lg bg-white dark:bg-[#0D1326]">
          <rect x="4" y="4" width="352" height="352" fill="none" stroke="currentColor" className="text-amber-600/50 dark:text-amber-400/40" strokeWidth="1.5" />
          <line x1="4" y1="4" x2="356" y2="356" stroke="currentColor" className="text-amber-600/40 dark:text-amber-400/35" strokeWidth="1.2" />
          <line x1="356" y1="4" x2="4" y2="356" stroke="currentColor" className="text-amber-600/40 dark:text-amber-400/35" strokeWidth="1.2" />
          <polygon points="180,4 356,180 180,356 4,180" fill="none" stroke="currentColor" className="text-amber-600/55 dark:text-amber-400/45" strokeWidth="1.3" />

          {Array.from({ length: 12 }, (_, idx) => idx + 1).map((h) => {
            const c = houseCoords[h];
            const signNum = signForHouse(h);
            const planets = byHouse[h];
            return (
              <g key={h}>
                <text
                  x={c.x}
                  y={c.y - 10}
                  textAnchor="middle"
                  className="fill-amber-600 dark:fill-amber-400 text-[11px] font-mono font-semibold"
                >
                  {signNum}
                </text>
                <text
                  x={c.x}
                  y={c.y + 8}
                  textAnchor="middle"
                  className="fill-slate-800 dark:fill-slate-100 text-[11px] font-mono font-medium"
                >
                  {planets.slice(0, 3).join(' ')}
                </text>
                {planets.length > 3 && (
                  <text
                    x={c.x}
                    y={c.y + 22}
                    textAnchor="middle"
                    className="fill-slate-700 dark:fill-slate-200 text-[10px] font-mono"
                  >
                    {planets.slice(3).join(' ')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (styleType === 'south') {
    // Classic South Indian 4x4 grid (Signs fixed: Pisces top-left -> clockwise)
    const gridMap: { signIdx: number; row: number; col: number }[] = [
      { signIdx: 11, row: 0, col: 0 }, { signIdx: 0, row: 0, col: 1 }, { signIdx: 1, row: 0, col: 2 }, { signIdx: 2, row: 0, col: 3 },
      { signIdx: 10, row: 1, col: 0 }, { signIdx: 3, row: 1, col: 3 },
      { signIdx: 9, row: 2, col: 0 }, { signIdx: 4, row: 2, col: 3 },
      { signIdx: 8, row: 3, col: 0 }, { signIdx: 7, row: 3, col: 1 }, { signIdx: 6, row: 3, col: 2 }, { signIdx: 5, row: 3, col: 3 },
    ];

    return (
      <div className="w-full max-w-[380px] mx-auto">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 text-center">
          {title} · South Indian
        </p>
        <svg viewBox="0 0 360 360" className="w-full h-auto border border-amber-500/40 rounded-lg bg-white dark:bg-[#0D1326]">
          {gridMap.map((cell) => {
            const x = cell.col * 90;
            const y = cell.row * 90;
            const isAsc = cell.signIdx === ascendantSignIndex;
            const items = bySign[cell.signIdx];
            return (
              <g key={cell.signIdx}>
                <rect
                  x={x}
                  y={y}
                  width="90"
                  height="90"
                  fill={isAsc ? 'rgba(245, 158, 11, 0.08)' : 'none'}
                  stroke="currentColor"
                  className="text-amber-600/40 dark:text-amber-400/35"
                  strokeWidth="1"
                />
                <text
                  x={x + 6}
                  y={y + 15}
                  className="fill-amber-700 dark:fill-amber-400 text-[9px] font-mono"
                >
                  {ZODIAC_SIGNS[cell.signIdx].name.slice(0, 3)}
                </text>
                <text
                  x={x + 45}
                  y={y + 46}
                  textAnchor="middle"
                  className="fill-slate-800 dark:fill-slate-100 text-[11px] font-mono font-medium"
                >
                  {items.slice(0, 3).join(' ')}
                </text>
                {items.length > 3 && (
                  <text
                    x={x + 45}
                    y={y + 62}
                    textAnchor="middle"
                    className="fill-slate-700 dark:fill-slate-200 text-[10px] font-mono"
                  >
                    {items.slice(3).join(' ')}
                  </text>
                )}
              </g>
            );
          })}
          <text x="180" y="175" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-xs font-display font-semibold">
            {title}
          </text>
          <text x="180" y="195" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px]">
            Lagna: {ZODIAC_SIGNS[ascendantSignIndex].name}
          </text>
        </svg>
      </div>
    );
  }

  // East Indian (Bengali / Maithili) 3x3 layout with split corner triangles
  const eastBoxes: { signIdx: number; x: number; y: number; w: number; h: number }[] = [
    { signIdx: 0, x: 120, y: 0, w: 120, h: 120 }, // Aries top center
    { signIdx: 1, x: 0, y: 0, w: 120, h: 60 },    // Taurus top-left upper
    { signIdx: 2, x: 0, y: 60, w: 120, h: 60 },   // Gemini top-left lower
    { signIdx: 3, x: 0, y: 120, w: 120, h: 120 }, // Cancer middle left
    { signIdx: 4, x: 0, y: 240, w: 120, h: 60 },  // Leo bottom-left upper
    { signIdx: 5, x: 0, y: 300, w: 120, h: 60 },  // Virgo bottom-left lower
    { signIdx: 6, x: 120, y: 240, w: 120, h: 120 }, // Libra bottom center
    { signIdx: 7, x: 240, y: 300, w: 120, h: 60 }, // Scorpio bottom-right lower
    { signIdx: 8, x: 240, y: 240, w: 120, h: 60 }, // Sagittarius bottom-right upper
    { signIdx: 9, x: 240, y: 120, w: 120, h: 120 }, // Capricorn middle right
    { signIdx: 10, x: 240, y: 60, w: 120, h: 60 }, // Aquarius top-right lower
    { signIdx: 11, x: 240, y: 0, w: 120, h: 60 },  // Pisces top-right upper
  ];

  return (
    <div className="w-full max-w-[380px] mx-auto">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 text-center">
        {title} · East Indian
      </p>
      <svg viewBox="0 0 360 360" className="w-full h-auto border border-amber-500/40 rounded-lg bg-white dark:bg-[#0D1326]">
        {eastBoxes.map((b) => {
          const isAsc = b.signIdx === ascendantSignIndex;
          const items = bySign[b.signIdx];
          return (
            <g key={b.signIdx}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                fill={isAsc ? 'rgba(245, 158, 11, 0.08)' : 'none'}
                stroke="currentColor"
                className="text-amber-600/40 dark:text-amber-400/35"
                strokeWidth="1"
              />
              <text x={b.x + 6} y={b.y + 14} className="fill-amber-700 dark:fill-amber-400 text-[9px] font-mono">
                {ZODIAC_SIGNS[b.signIdx].name.slice(0, 3)}
              </text>
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h / 2 + 5}
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-100 text-[11px] font-mono font-medium"
              >
                {items.join(' ')}
              </text>
            </g>
          );
        })}
        <text x="180" y="176" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-xs font-display font-semibold">
          {title}
        </text>
        <text x="180" y="194" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px]">
          Lagna: {ZODIAC_SIGNS[ascendantSignIndex].name}
        </text>
      </svg>
    </div>
  );
};
