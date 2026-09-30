/**
 * The panels of the artist-system background.
 *
 * Widths are deliberately modest — the widest is 16rem — because the headline
 * leaves only a 206px lane at 1280. Narrow panels mean the edge crop stays
 * shallow enough that every label is still readable, and disappears entirely
 * from 1440 up.
 *
 * These are built as real DOM/CSS interface elements rather than crops of a
 * composite image. That is what lets each one animate on its own clock, stay
 * crisp at any pixel density, reflow per breakpoint, and read as part of the
 * website rather than a picture of one.
 *
 * The panels use a solid tint rather than backdrop-blur. Eight backdrop-filter
 * surfaces each force the compositor to read back everything beneath them every
 * frame; the field behind is near-flat, so the blur bought nothing.
 *
 * Motion is kept at the panel level rather than the element level. An earlier
 * pass animated all 56 waveform bars, all 7 stream bars and all 5 territory bars
 * individually, which was 68 extra animated nodes for sub-pixel drift nobody can
 * perceive. The panel's own float clock plus the waveform's scanning read-head
 * carry the life; the marks inside stay still.
 *
 * Figures here are demonstration data. The now-playing panel shows the same
 * release as the phone showcase so the two read as one product; the release card
 * uses a fictional title so nothing implies a real distribution deal. Nothing is
 * presented as a real account or a company statistic.
 */

import { Wallet, ArrowRight } from "lucide-react";
import { COVERS } from "../data";
import CoverArt from "../art/CoverArt";
import ReleaseCover from "../product/ReleaseCover";
import { FEATURED_RELEASE } from "../product/release";

/* ── Shared chrome ──────────────────────────────────────────────────── */

/** The glass panel every product card sits on. */
function Panel({
  children,
  className = "",
  sheen = false,
}: {
  children: React.ReactNode;
  className?: string;
  sheen?: boolean;
}) {
  return (
    <div
      /* Stable hook for the hero collision test, which asserts that no
         background surface ever overlaps the headline, deck or CTAs. */
      data-bg-surface=""
      className={`relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#140F26]/92 ${className}`}
      style={{ boxShadow: "0 24px 60px -30px rgba(0,0,0,0.9)" }}
    >
      {children}
      {sheen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
            animation: "sheen 9s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-semibold tracking-[0.01em] text-white/45">
      {children}
    </p>
  );
}

function Delta({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.625rem] font-bold text-lime">{children}</span>
  );
}

/* ── Streams ────────────────────────────────────────────────────────── */

const BARS = [38, 52, 44, 66, 58, 80, 100];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function StreamsPanel() {
  return (
    <Panel className="w-[13.5rem] p-4">
      <Label>Streams</Label>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-[1.375rem] font-extrabold tracking-[-0.03em] tabular-nums text-white">
          128.5K
        </span>
        <Delta>+24%</Delta>
      </p>

      <div className="mt-3.5 flex h-16 items-end gap-1.5">
        {/* height:% needs a parent with a definite height, so the bar IS the
            flex child — an intermediate wrapper resolved these to zero. */}
        {BARS.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-[3px]"
            style={{
              height: `${h}%`,
              background:
                i === BARS.length - 1
                  ? "linear-gradient(180deg,#A78BFF,#6D2BFF)"
                  : "linear-gradient(180deg,rgba(167,139,255,0.6),rgba(109,43,255,0.32))",
              transformOrigin: "bottom",
            }}
          />
        ))}
      </div>

      <div className="mt-2 flex gap-1.5">
        {DAYS.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[0.5rem] font-semibold text-white/30"
          >
            {d}
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ── Earnings ───────────────────────────────────────────────────────── */

const EARN_PATH =
  "M4 62 C 26 60, 40 44, 62 46 C 84 48, 96 30, 118 26 C 140 22, 152 34, 174 30 C 196 26, 206 12, 226 8";

export function EarningsPanel() {
  return (
    <Panel className="w-[15rem] p-4" sheen>
      <Label>Total earnings</Label>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-[1.5rem] font-extrabold tracking-[-0.035em] tabular-nums text-white">
          $2,354.18
        </span>
        <Delta>+18%</Delta>
      </p>

      <svg
        viewBox="0 0 230 72"
        className="mt-3 w-full"
        role="img"
        aria-label="Earnings trending upward over the period"
      >
        <defs>
          <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CBF24C" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#CBF24C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${EARN_PATH} L 226 72 L 4 72 Z`} fill="url(#earnFill)" />
        {/* Draws itself once, slowly, then holds. */}
        <path
          d={EARN_PATH}
          fill="none"
          stroke="#CBF24C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="320"
          style={{
            animation: "draw-line 2.4s cubic-bezier(0.22,1,0.36,1) 0.6s both",
            strokeDashoffset: 320,
          }}
        />
      </svg>
    </Panel>
  );
}

/* ── Now playing / waveform ─────────────────────────────────────────── */

/** Deterministic amplitudes — a random() call would reshuffle every render. */
const WAVE = Array.from({ length: 56 }, (_, i) => {
  const a = Math.sin(i * 0.55) * 0.5 + 0.5;
  const b = Math.sin(i * 0.17 + 1.2) * 0.5 + 0.5;
  return 0.2 + a * 0.45 + b * 0.35;
});

export function WaveformPanel() {
  return (
    <Panel className="w-[16rem] p-4">
      <div className="flex items-center gap-3">
        <span className="h-8 w-8 shrink-0 overflow-hidden rounded-md">
          <ReleaseCover size="thumb" eager={false} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.8125rem] font-bold text-white">
            {FEATURED_RELEASE.title}
          </span>
          <span className="block truncate text-[0.6875rem] font-medium text-white/45">
            {FEATURED_RELEASE.artist}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-lime"
            style={{ animation: "live-pulse 2.8s ease-in-out infinite" }}
          />
          <span className="text-[0.625rem] font-bold text-lime">Live</span>
        </span>
      </div>

      {/* Waveform with a read-head sweeping across it. */}
      <div className="relative mt-3.5 flex h-9 items-center gap-[1.5px] overflow-hidden">
        {WAVE.map((a, i) => (
          <span
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${a * 100}%`,
              background: i < 22 ? "#CBF24C" : "rgba(203,242,76,0.28)",
            }}
          />
        ))}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(203,242,76,0.32), transparent)",
            animation: "wave-scan 7s linear infinite",
          }}
        />
      </div>

      <p className="mt-1.5 text-right text-[0.625rem] font-semibold tabular-nums text-lime/80">
        02:45
      </p>
    </Panel>
  );
}

/* ── Territories ────────────────────────────────────────────────────── */

const COUNTRIES = [
  { n: "Tanzania", v: 35 },
  { n: "Kenya", v: 22 },
  { n: "Nigeria", v: 18 },
  { n: "South Africa", v: 10 },
  { n: "Others", v: 15 },
];

export function CountriesPanel() {
  return (
    <Panel className="w-[14rem] p-4">
      <Label>Top countries</Label>
      <ul className="mt-3 space-y-2.5">
        {COUNTRIES.map((c, i) => (
          <li key={c.n} className="flex items-center gap-3">
            <span className="w-[5.5rem] shrink-0 truncate text-[0.6875rem] font-semibold text-white/75">
              {c.n}
            </span>
            <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${c.v * 2.4}%`,
                  background: "linear-gradient(90deg,#6D2BFF,#A78BFF)",
                }}
              />
            </span>
            <span className="w-7 shrink-0 text-right text-[0.625rem] font-bold tabular-nums text-white/55">
              {c.v}%
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ── Release ────────────────────────────────────────────────────────── */

export function ReleasePanel() {
  return (
    <Panel className="w-[16rem] p-3.5" sheen>
      <div className="flex items-start gap-3.5">
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[0.625rem] font-bold text-lime">New release</p>
          <p className="mt-1.5 text-[1.0625rem] font-extrabold leading-tight tracking-[-0.03em] text-white">
            Another Day
          </p>
          <p className="mt-0.5 text-[0.75rem] font-medium italic text-white/55">
            Juxo
          </p>
          <p className="mt-2 text-[0.625rem] font-medium text-white/35">
            Single · 2024
          </p>
          <p className="mt-3 flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-lime"
              style={{ animation: "live-pulse 3.4s ease-in-out infinite" }}
            />
            <span className="text-[0.625rem] font-semibold text-white/60">
              Live on stores
            </span>
          </p>
        </div>
        <span className="h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-lg">
          <CoverArt cover={COVERS[7]} caption={false} />
        </span>
      </div>
    </Panel>
  );
}

/* ── Wallet ─────────────────────────────────────────────────────────── */

export function WalletPanel() {
  return (
    <Panel className="w-[16rem]" sheen>
      <div className="p-4">
        <Label>Available balance</Label>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="flex items-baseline gap-1.5">
            <span className="text-[1.5rem] font-extrabold tracking-[-0.035em] tabular-nums text-white">
              $1,480.75
            </span>
            <span className="text-[0.6875rem] font-bold text-white/45">
              USD
            </span>
          </p>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime"
            style={{ boxShadow: "0 0 22px -4px rgba(203,242,76,0.6)" }}
          >
            <Wallet className="h-4 w-4" strokeWidth={2.3} color="#0E0E0E" />
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.09] px-4 py-3">
        <span className="text-[0.75rem] font-semibold text-white/70">
          Withdraw
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-white/45" strokeWidth={2.2} />
      </div>
    </Panel>
  );
}

/* ── Album wall ─────────────────────────────────────────────────────── */

/** Four sleeves in a loose grid, each drifting on its own clock. */
export function AlbumGrid() {
  const picks = [7, 13, 1, 17].map((i) => COVERS[i]);
  const clocks = ["layer-float-a", "layer-float-c", "layer-float-b", "layer-float-d"];

  return (
    <div className="grid w-[15rem] grid-cols-2 gap-3">
      {picks.map((c, i) => (
        <div key={c.id} className={clocks[i]}>
          <div
            className="aspect-square overflow-hidden rounded-lg"
            style={{ boxShadow: "0 20px 44px -22px rgba(0,0,0,0.9)" }}
          >
            <CoverArt cover={c} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Waveform strip (mobile) ────────────────────────────────────────── */

/**
 * The waveform with no card around it.
 *
 * Mobile has a measured 48px of clear space between the fixed nav and the copy —
 * enough for the music signal, not enough for a panel. A bare 28px strip fits
 * where a card cannot, so small screens still get the sense that something is
 * playing.
 */
export function WaveformStrip() {
  return (
    <div data-bg-surface="" className="fade-x relative h-7 w-full overflow-hidden">
      <div className="flex h-full items-center gap-[2px]">
        {WAVE.map((a, i) => (
          <span
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${a * 100}%`,
              background: i < 22 ? "rgba(203,242,76,0.85)" : "rgba(203,242,76,0.24)",
            }}
          />
        ))}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-12"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(203,242,76,0.35), transparent)",
          animation: "wave-scan 8s linear infinite",
        }}
      />
    </div>
  );
}
