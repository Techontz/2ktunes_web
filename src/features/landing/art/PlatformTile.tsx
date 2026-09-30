/**
 * Destination tiles for the platform ecosystem.
 *
 * The glyphs are simplified, generic audio marks (waveform, note, play, bars)
 * rather than reproductions of each service's trademarked logo. Platform names
 * are used nominatively to identify where 2K Tunes delivers releases.
 */

import { memo } from "react";
import type { Platform } from "../data";

function Glyph({ mark, color }: { mark: string; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 2.1, strokeLinecap: "round" as const };

  switch (mark) {
    case "spotify":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          <path {...common} d="M5.5 8.6c4.2-1.5 9-1.1 12.9 1.1" />
          <path {...common} d="M6.6 12.4c3.4-1.1 7.2-.8 10.4.9" />
          <path {...common} d="M7.7 16c2.6-.8 5.5-.6 8 .7" />
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          <path {...common} d="M3 12c1.4 0 1.7-4 3.1-4s1.7 8 3.1 8 1.7-9 3.1-9 1.7 6 3.1 6 1.6-3 3-3H21" />
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          {[
            [5, 9, 6],
            [9.7, 5, 14],
            [14.3, 8, 8],
            [19, 11, 2],
          ].map(([x, y, h], i) => (
            <rect key={i} x={x - 1.4} y={y} width="2.8" height={h + 4} rx="1.4" fill={color} />
          ))}
        </svg>
      );
    case "note":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          <path
            d="M18.5 4.2 10 6.1v9.2a2.9 2.9 0 1 0 1.9 2.7V8.3l6.6-1.5V4.2Z"
            fill={color}
          />
          <circle cx="9" cy="18" r="2.9" fill={color} />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          <path d="M9 6.6 18 12l-9 5.4V6.6Z" fill={color} />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          <path
            d="M14.2 3h2.6c.3 2 1.5 3.4 3.5 3.7v2.6a6.9 6.9 0 0 1-3.4-1v5.9a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a2.9 2.9 0 1 0 2 2.8V3Z"
            fill={color}
          />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          <rect x="4" y="4" width="16" height="16" rx="5" {...common} />
          <circle cx="12" cy="12" r="3.6" {...common} />
          <circle cx="16.8" cy="7.3" r="1.1" fill={color} />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          <path
            d="M14.6 21v-7.4h2.6l.4-3h-3V8.8c0-.9.3-1.5 1.6-1.5H17.7V4.6A22 22 0 0 0 15.4 4.5c-2.3 0-3.9 1.4-3.9 4v2.1H9v3h2.5V21h3.1Z"
            fill={color}
          />
        </svg>
      );
    case "tidal":
      return (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2">
          {[
            [7.2, 8.4],
            [12, 8.4],
            [16.8, 8.4],
            [12, 13.2],
          ].map(([cx, cy], i) => (
            <rect
              key={i}
              x={cx - 2.4}
              y={cy - 2.4}
              width="4.8"
              height="4.8"
              transform={`rotate(45 ${cx} ${cy})`}
              fill={color}
              opacity={0.92}
            />
          ))}
        </svg>
      );
    default:
      return null;
  }
}

const PlatformTile = memo(function PlatformTile({
  platform,
  className = "",
}: {
  platform: Platform;
  className?: string;
}) {
  return (
    <div
      title={platform.name}
      className={`flex aspect-square items-center justify-center rounded-[26%] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] ring-1 ring-black/10 ${className}`}
      style={{ background: platform.bg }}
    >
      <Glyph mark={platform.mark} color={platform.fg} />
    </div>
  );
});

export default PlatformTile;
