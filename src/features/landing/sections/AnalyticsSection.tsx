import { motion } from "motion/react";
import { PLATFORM_SPLIT, TERRITORIES, TREND } from "../data";
import { Band, Card, Eyebrow, Opener, Reveal } from "../ui";

/**
 * Charts here follow one rule: every mark is a magnitude, so every chart uses a
 * single hue with the value carried by length, and every value is directly
 * labelled. Nothing on this page identifies a series by colour alone.
 *
 * All figures are illustrative sample data, labelled as such in the UI.
 */

const W = 640;
const H = 220;
const PAD = { t: 18, r: 16, b: 26, l: 16 };

function trendPath() {
  const max = Math.max(...TREND);
  const min = Math.min(...TREND);
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const pts = TREND.map((v, i) => {
    const x = PAD.l + (i / (TREND.length - 1)) * iw;
    const y = PAD.t + ih - ((v - min) / (max - min)) * ih;
    return [x, y] as const;
  });

  // Catmull-Rom → cubic bézier, so the curve stays smooth without overshoot.
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }

  return { d, pts };
}

function TrendChart() {
  const { d, pts } = trendPath();
  const last = pts[pts.length - 1];
  const area = `${d} L ${last[0]} ${H - PAD.b} L ${pts[0][0]} ${H - PAD.b} Z`;

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow className="text-white/35">Release performance</Eyebrow>
          <h3 className="t-card mt-3 text-white">Streams, last 18 months</h3>
        </div>
        <div className="text-right">
          <p className="text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-white">
            1.14M
          </p>
          <p className="mt-1.5 text-[0.75rem] font-bold text-lime">
            +142% year on year
          </p>
        </div>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-7 w-full overflow-visible"
        role="img"
        aria-label="Monthly stream volume rising from 8,000 to 92,000 over 18 months"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CBF24C" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#CBF24C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Recessive baseline grid */}
        {[0, 0.34, 0.67, 1].map((f) => (
          <line
            key={f}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + f * (H - PAD.t - PAD.b)}
            y2={PAD.t + f * (H - PAD.t - PAD.b)}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}

        <motion.path
          d={area}
          fill="url(#trendFill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.7 }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="#CBF24C"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Endpoint marker — 10px, ringed against the surface */}
        <motion.circle
          cx={last[0]}
          cy={last[1]}
          r="5"
          fill="#CBF24C"
          stroke="#161616"
          strokeWidth="2.5"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        />

        <text
          x={PAD.l}
          y={H - 6}
          fill="rgba(255,255,255,0.3)"
          fontSize="11"
          fontWeight="600"
        >
          Mar 2024
        </text>
        <text
          x={W - PAD.r}
          y={H - 6}
          textAnchor="end"
          fill="rgba(255,255,255,0.3)"
          fontSize="11"
          fontWeight="600"
        >
          Aug 2025
        </text>
      </svg>
    </figure>
  );
}

/** Horizontal magnitude bars: one hue, length carries the value, always labelled. */
function MagnitudeBars({
  rows,
  hue,
  light,
}: {
  rows: { label: string; value: number; note?: string }[];
  hue: string;
  light?: boolean;
}) {
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <ul className="space-y-4">
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={`text-[0.875rem] font-bold ${light ? "text-ink" : "text-white"}`}
            >
              {r.label}
            </span>
            <span
              className={`text-[0.8125rem] font-bold tabular-nums ${
                light ? "text-ink/45" : "text-white/45"
              }`}
            >
              {r.note ? `${r.note} · ` : ""}
              {r.value}%
            </span>
          </div>
          <div
            className={`mt-2 h-2 w-full overflow-hidden rounded-full ${
              light ? "bg-ink/8" : "bg-white/8"
            }`}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: hue, opacity: 1 - i * 0.13 }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(r.value / max) * 100}%` }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.9,
                delay: 0.12 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Illustrative 30-day figures for the same demonstration release. */
const TILES = [
  { v: "42,892", l: "streams", s: "+18% vs. last 30 days" },
  { v: "8,214", l: "listeners", s: "+12% vs. last 30 days" },
  { v: "31", l: "countries", s: "4 new this period" },
  { v: "$428.90", l: "estimated earnings", s: "before payout" },
];

export default function AnalyticsSection() {
  return (
    <Band id="analytics" tone="bone">
      <div className="shell">
        <Opener
          tone="light"
          eyebrow="Analytics"
          title="Know how your music is moving."
          deck="See which songs are growing, which countries are picking them up, and which platforms are carrying them — so your next release is a decision instead of a guess."
        />

        <div className="mt-14 grid gap-4 md:mt-20 md:gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Card className="h-full bg-carbon-2 p-7 sm:p-9">
              <TrendChart />
            </Card>
          </Reveal>

          <Reveal delay={0.07} className="lg:col-span-5">
            <Card className="h-full bg-paper p-7 sm:p-9">
              <Eyebrow className="text-ink/40">Territories</Eyebrow>
              <h3 className="t-card mt-3 text-ink">Where they listen</h3>
              <div className="mt-7">
                <MagnitudeBars
                  light
                  hue="#6D2BFF"
                  rows={TERRITORIES.map((t) => ({
                    label: t.name,
                    value: t.share,
                    note: t.streams,
                  }))}
                />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.04} className="lg:col-span-5">
            <Card className="h-full bg-slab p-7 sm:p-9">
              <Eyebrow className="text-white/35">Platforms</Eyebrow>
              <h3 className="t-card mt-3 text-white">Share of streams</h3>
              <div className="mt-7">
                <MagnitudeBars
                  hue="#CBF24C"
                  rows={PLATFORM_SPLIT.map((p) => ({
                    label: p.name,
                    value: p.value,
                  }))}
                />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <Card className="flex h-full flex-col justify-between bg-paper p-7 sm:p-9">
              <div>
                <Eyebrow className="text-ink/40">Last 30 days</Eyebrow>
                <h3 className="t-card mt-3 text-ink">
                  The signals worth watching
                </h3>
              </div>

              <dl className="mt-9 grid gap-7 sm:grid-cols-2">
                {TILES.map((t) => (
                  <div key={t.l}>
                    <dd className="text-[1.875rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-ink">
                      {t.v}
                    </dd>
                    <dt className="mt-2 text-[0.8125rem] font-bold text-ink/70">
                      {t.l}
                    </dt>
                    <p className="mt-1 text-[0.75rem] font-semibold text-volt-deep">
                      {t.s}
                    </p>
                  </div>
                ))}
              </dl>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-center text-[0.75rem] font-medium text-ink/35">
            Figures shown are sample data for a demonstration release, not
            aggregate platform statistics.
          </p>
        </Reveal>
      </div>
    </Band>
  );
}
