import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Check,
  ChevronLeft,
  Disc3,
  House,
  Store,
  User,
  Wallet,
} from "lucide-react";
import { PLATFORMS } from "../data";
import PlatformTile from "../art/PlatformTile";
import ReleaseCover from "./ReleaseCover";
import { FEATURED_RELEASE } from "./release";

/**
 * 2K Tunes mobile app, shown in a physical device.
 *
 * Two things make this read as a real product rather than a black rectangle:
 *
 * 1. The device is built in layers — ambient shadow, a metal rim drawn as a
 *    multi-stop gradient (not a flat border), thin black bezel, screen, and a
 *    single specular sheen — with concentric corner radii, the way a real
 *    display sits inside a real chassis.
 *
 * 2. Everything inside is sized through `u()`, which converts a measurement
 *    taken at the 300px design width into `cqw`. The interface is therefore
 *    proportionally identical at 210px on a phone and 340px on a desktop, and
 *    still renders as crisp text rather than a scaled bitmap.
 */

/** Design width the interface was drawn at. */
const DESIGN_W = 300;
/** Frame + bezel eaten on each side, so `u()` is relative to the screen. */
const SCREEN_W = 282;

/** A measurement in design px → container-relative units. */
const u = (px: number) => `${(px / SCREEN_W) * 100}cqw`;

const INK = "#08080A";
const LIME = "#CBF24C";
const VOLT = "#6D2BFF";
const AMBER = "#FFC94A";

const RELEASE = FEATURED_RELEASE;

/* ── App chrome ─────────────────────────────────────────────────────── */

function StatusBar() {
  return (
    <div
      className="flex shrink-0 items-center justify-between"
      style={{ padding: `${u(13)} ${u(22)} ${u(4)}` }}
    >
      <span
        style={{
          fontSize: u(11),
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.01em",
        }}
      >
        9:41
      </span>
      <span className="flex items-end" style={{ gap: u(4) }}>
        {/* signal */}
        <span className="flex items-end" style={{ gap: u(1.5) }}>
          {[4, 6, 8, 10].map((h, i) => (
            <span
              key={h}
              style={{
                width: u(2.5),
                height: u(h),
                borderRadius: u(1),
                background: i === 3 ? "rgba(255,255,255,0.35)" : "#fff",
              }}
            />
          ))}
        </span>
        {/* wifi */}
        <svg
          viewBox="0 0 16 12"
          style={{ width: u(13), height: u(10) }}
          aria-hidden
        >
          <path
            d="M8 10.4 5.6 8a3.4 3.4 0 0 1 4.8 0L8 10.4Z"
            fill="#fff"
          />
          <path
            d="M3.4 5.8a6.6 6.6 0 0 1 9.2 0"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M1.4 3.4a9.5 9.5 0 0 1 13.2 0"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {/* battery */}
        <span
          className="relative flex items-center"
          style={{
            width: u(23),
            height: u(11),
            borderRadius: u(3),
            border: `${u(1)} solid rgba(255,255,255,0.4)`,
            padding: u(1.5),
          }}
        >
          <span
            style={{
              width: "72%",
              height: "100%",
              borderRadius: u(1.5),
              background: "#fff",
            }}
          />
        </span>
      </span>
    </div>
  );
}

function AppHeader({ title }: { title: string }) {
  return (
    <div
      className="flex shrink-0 items-center"
      style={{ padding: `${u(6)} ${u(18)} ${u(10)}`, gap: u(10) }}
    >
      <span
        className="flex items-center justify-center"
        style={{
          width: u(30),
          height: u(30),
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
        }}
      >
        <ChevronLeft
          style={{ width: u(15), height: u(15) }}
          color="rgba(255,255,255,0.75)"
          strokeWidth={2.4}
        />
      </span>
      <span
        style={{
          fontSize: u(15),
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#fff",
        }}
      >
        {title}
      </span>
      <span className="ml-auto flex items-baseline" style={{ gap: u(1) }}>
        <span
          style={{
            fontSize: u(12),
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color: "#fff",
          }}
        >
          2K
        </span>
        <span
          style={{
            fontSize: u(12),
            fontWeight: 800,
            letterSpacing: "-0.05em",
            color: "#fff",
          }}
        >
          Tunes<span style={{ color: "#A78BFF" }}>.</span>
        </span>
      </span>
    </div>
  );
}

function TabBar({ active }: { active: number }) {
  const tabs = [
    { Icon: House, label: "Home" },
    { Icon: Disc3, label: "Releases" },
    { Icon: Wallet, label: "Wallet" },
    { Icon: User, label: "Profile" },
  ];

  return (
    <div
      className="mt-auto shrink-0"
      style={{
        borderTop: `${u(1)} solid rgba(255,255,255,0.07)`,
        padding: `${u(9)} ${u(14)} ${u(7)}`,
      }}
    >
      <div className="flex items-start justify-between">
        {tabs.map(({ Icon, label }, i) => (
          <span
            key={label}
            className="flex flex-1 flex-col items-center"
            style={{ gap: u(4) }}
          >
            <Icon
              style={{ width: u(17), height: u(17) }}
              color={i === active ? "#fff" : "rgba(255,255,255,0.34)"}
              strokeWidth={i === active ? 2.4 : 1.9}
            />
            <span
              style={{
                fontSize: u(10),
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: i === active ? "#fff" : "rgba(255,255,255,0.3)",
              }}
            >
              {label}
            </span>
          </span>
        ))}
      </div>
      {/* home indicator */}
      <span
        className="mx-auto block"
        style={{
          marginTop: u(6),
          width: u(96),
          height: u(4),
          borderRadius: u(2),
          background: "rgba(255,255,255,0.28)",
        }}
      />
    </div>
  );
}

/* ── Screen A — New release ─────────────────────────────────────────── */

const STEPS = [
  { label: "Audio & artwork", done: true },
  { label: "Metadata & credits", done: true },
  { label: "Store delivery", done: true },
  { label: "Release date", done: false },
];

function ReleaseScreen() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="New release" />

      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ padding: `0 ${u(18)}` }}
      >
        {/* Explicit square with shrink-0: inside a flex column, `aspect-square`
            alone gets overridden by flex shrinking and the sleeve crops. */}
        <div
          className="mx-auto shrink-0 overflow-hidden"
          style={{
            width: u(190),
            height: u(190),
            borderRadius: u(16),
            boxShadow: `0 ${u(12)} ${u(28)} -${u(10)} rgba(0,0,0,0.7)`,
          }}
        >
          <ReleaseCover />
        </div>

        <div
          className="flex shrink-0 items-end justify-between"
          style={{ marginTop: u(14), gap: u(10) }}
        >
          <span>
            <span
              className="block"
              style={{
                fontSize: u(21),
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                color: "#fff",
              }}
            >
              {RELEASE.title}
            </span>
            <span
              className="block"
              style={{
                marginTop: u(3),
                fontSize: u(11.5),
                fontWeight: 500,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {RELEASE.artist}
            </span>
            <span
              className="block"
              style={{
                marginTop: u(2),
                fontSize: u(10.5),
                fontWeight: 500,
                color: "rgba(255,255,255,0.32)",
              }}
            >
              {RELEASE.type} · {RELEASE.project}
            </span>
          </span>
          <span
            className="shrink-0"
            style={{
              fontSize: u(9),
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: LIME,
              background: "rgba(203,242,76,0.12)",
              borderRadius: u(20),
              padding: `${u(5)} ${u(9)}`,
            }}
          >
            Draft
          </span>
        </div>

        {/* Setup progress — the checklist below carries the labels, so this is
            just the bar and a count. */}
        <div className="shrink-0" style={{ marginTop: u(13) }}>
          <div
            className="flex items-center"
            style={{ gap: u(9), marginBottom: u(7) }}
          >
            <span
              className="block flex-1 overflow-hidden"
              style={{
                height: u(4),
                borderRadius: u(2),
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <motion.span
                className="block h-full"
                style={{ borderRadius: u(2), background: LIME }}
                initial={{ width: "0%" }}
                whileInView={{ width: "75%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span
              style={{
                fontSize: u(9.5),
                fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              3 of 4
            </span>
          </div>
        </div>

        <ul className="shrink-0" style={{ marginTop: u(2) }}>
          {STEPS.map((s, i) => (
            <li
              key={s.label}
              className="flex items-center"
              style={{
                gap: u(10),
                paddingTop: u(7.5),
                paddingBottom: u(7.5),
                borderTop:
                  i === 0 ? "none" : `${u(1)} solid rgba(255,255,255,0.06)`,
              }}
            >
              <span
                className="flex shrink-0 items-center justify-center"
                style={{
                  width: u(19),
                  height: u(19),
                  borderRadius: "50%",
                  background: s.done ? LIME : "transparent",
                  border: s.done
                    ? "none"
                    : `${u(1.5)} solid rgba(255,255,255,0.22)`,
                }}
              >
                {s.done && (
                  <Check
                    style={{ width: u(11), height: u(11) }}
                    color={INK}
                    strokeWidth={3.6}
                  />
                )}
              </span>
              <span
                style={{
                  fontSize: u(12.5),
                  fontWeight: 600,
                  color: s.done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.38)",
                }}
              >
                {s.label}
              </span>
              {!s.done && (
                <span
                  className="ml-auto"
                  style={{
                    fontSize: u(10.5),
                    fontWeight: 700,
                    color: "#A78BFF",
                  }}
                >
                  Set
                </span>
              )}
            </li>
          ))}
        </ul>

        <div
          className="mt-auto flex shrink-0 items-center justify-center"
          style={{
            marginBottom: u(13),
            height: u(42),
            borderRadius: u(21),
            background: VOLT,
            boxShadow: `0 ${u(10)} ${u(22)} -${u(8)} rgba(109,43,255,0.9)`,
            fontSize: u(13.5),
            fontWeight: 700,
            color: "#fff",
          }}
        >
          Submit release
        </div>
      </div>

      <TabBar active={1} />
    </div>
  );
}

/* ── Screen B — Release status ──────────────────────────────────────── */

/**
 * The status sequence stops at "Release date" on purpose.
 *
 * This is a demonstration of the 2K Tunes release flow using a real track, so it
 * must not imply the track is currently distributed by 2K Tunes. Nothing here
 * says "Live on Spotify", "Delivered to stores" or "Available everywhere" — the
 * screen is labelled a preview and the final step is still pending.
 */
const TIMELINE = [
  { label: "Release submitted", date: "12 Aug", state: "done" },
  { label: "Artwork & metadata checked", date: "12 Aug", state: "done" },
  { label: "Delivery prepared", date: "13 Aug", state: "done" },
  { label: "Release date", date: "Pending", state: "pending" },
] as const;

function StatusScreen() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Release status" />

      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ padding: `0 ${u(18)}` }}
      >
        <div className="flex items-center" style={{ gap: u(12) }}>
          <span
            className="shrink-0 overflow-hidden"
            style={{ width: u(62), height: u(62), borderRadius: u(12) }}
          >
            <ReleaseCover size="thumb" eager={false} />
          </span>
          <span className="min-w-0">
            <span
              className="block truncate"
              style={{
                fontSize: u(17),
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#fff",
              }}
            >
              {RELEASE.title}
            </span>
            <span
              className="block truncate"
              style={{
                marginTop: u(2),
                fontSize: u(11),
                fontWeight: 500,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {RELEASE.artist} · {RELEASE.project}
            </span>
            {/* Amber "Release preview", never a lime "Live". This is a
                demonstration of the release flow using a real track, so the
                badge must not imply the track is distributed by 2K Tunes. */}
            <span
              className="inline-flex items-center"
              style={{
                marginTop: u(6),
                gap: u(5),
                fontSize: u(9.5),
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: AMBER,
                background: "rgba(255,201,74,0.13)",
                borderRadius: u(20),
                padding: `${u(4)} ${u(8)}`,
              }}
            >
              <span
                style={{
                  width: u(5),
                  height: u(5),
                  borderRadius: "50%",
                  background: AMBER,
                }}
              />
              Release preview
            </span>
          </span>
        </div>

        <ul style={{ marginTop: u(18) }}>
          {TIMELINE.map((t, i) => (
            <li key={t.label} className="flex" style={{ gap: u(12) }}>
              {/* rail */}
              <span
                className="relative flex shrink-0 flex-col items-center"
                style={{ width: u(18) }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: u(18),
                    height: u(18),
                    borderRadius: "50%",
                    marginTop: u(3),
                    background:
                      t.state === "pending"
                        ? "transparent"
                        : "rgba(255,255,255,0.14)",
                    border:
                      t.state === "pending"
                        ? `${u(1.5)} solid rgba(255,201,74,0.55)`
                        : "none",
                  }}
                >
                  {t.state === "done" && (
                    <Check
                      style={{ width: u(10), height: u(10) }}
                      color="rgba(255,255,255,0.85)"
                      strokeWidth={3.4}
                    />
                  )}
                </span>
                {i < TIMELINE.length - 1 && (
                  <span
                    className="flex-1"
                    style={{
                      width: u(1.5),
                      background:
                        "linear-gradient(rgba(255,255,255,0.16), rgba(255,255,255,0.06))",
                      marginTop: u(2),
                      marginBottom: u(2),
                    }}
                  />
                )}
              </span>

              <span
                className="flex flex-1 items-baseline justify-between"
                style={{ paddingBottom: u(16), gap: u(8) }}
              >
                <span
                  style={{
                    fontSize: u(12.5),
                    fontWeight: t.state === "pending" ? 800 : 600,
                    color:
                      t.state === "pending" ? "#fff" : "rgba(255,255,255,0.62)",
                  }}
                >
                  {t.label}
                </span>
                <span
                  style={{
                    fontSize: u(10.5),
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {t.date}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {/* Where it actually landed — fills the space above the action with
            something that reinforces what the product did. */}
        <div
          className="mt-auto"
          style={{
            borderTop: `${u(1)} solid rgba(255,255,255,0.07)`,
            paddingTop: u(14),
          }}
        >
          <div className="flex items-center justify-between" style={{ gap: u(8) }}>
            <span
              style={{
                fontSize: u(9.5),
                fontWeight: 800,
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.32)",
              }}
            >
              Delivering to
            </span>
            <span
              style={{
                fontSize: u(10.5),
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              150+ stores
            </span>
          </div>
          <div className="flex" style={{ gap: u(7), marginTop: u(10) }}>
            {PLATFORMS.slice(0, 6).map((p) => (
              <PlatformTile
                key={p.name}
                platform={p}
                className="min-w-0 flex-1 opacity-95"
              />
            ))}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            marginTop: u(14),
            marginBottom: u(14),
            height: u(42),
            borderRadius: u(21),
            border: `${u(1.5)} solid rgba(255,255,255,0.16)`,
            fontSize: u(13.5),
            fontWeight: 700,
            color: "#fff",
          }}
        >
          <Store
            style={{ width: u(14), height: u(14), marginRight: u(7) }}
            strokeWidth={2.2}
          />
          Review release
        </div>
      </div>

      <TabBar active={1} />
    </div>
  );
}

/* ── Device ─────────────────────────────────────────────────────────── */

export default function PhoneMock({
  className = "",
}: {
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setScreen((s) => (s === 0 ? 1 : 0)), 5200);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className={`relative ${className}`}>
      {/* Layer 1 — ambient contact shadow, cast on the surface below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 h-16 w-[86%] -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: "-2.2rem",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.34) 0%, transparent 72%)",
          filter: "blur(14px)",
        }}
      />

      {/* Layer 2 + 3 — chassis, with the rim drawn as a metal gradient. */}
      <div
        className="relative"
        style={{
          borderRadius: "13.2%/6.1%",
          padding: "0.7%",
          background:
            "linear-gradient(148deg, #9A9AA2 0%, #33333A 16%, #6E6E78 38%, #232329 58%, #7E7E88 78%, #2C2C33 92%, #85858F 100%)",
          boxShadow: [
            "0 1px 2px rgba(255,255,255,0.28) inset",
            "0 42px 70px -30px rgba(0,0,0,0.72)",
            "0 14px 26px -14px rgba(0,0,0,0.55)",
          ].join(", "),
        }}
      >
        {/* Side buttons, in the same metal as the rim. */}
        <span
          aria-hidden
          className="absolute"
          style={{
            left: "-0.9%",
            top: "17%",
            width: "1%",
            height: "5%",
            borderRadius: "2px 0 0 2px",
            background: "linear-gradient(90deg, #24242A, #7B7B85)",
          }}
        />
        <span
          aria-hidden
          className="absolute"
          style={{
            left: "-0.9%",
            top: "25%",
            width: "1%",
            height: "9%",
            borderRadius: "2px 0 0 2px",
            background: "linear-gradient(90deg, #24242A, #7B7B85)",
          }}
        />
        <span
          aria-hidden
          className="absolute"
          style={{
            right: "-0.9%",
            top: "23%",
            width: "1%",
            height: "12%",
            borderRadius: "0 2px 2px 0",
            background: "linear-gradient(270deg, #24242A, #7B7B85)",
          }}
        />

        {/* Bezel — concentric radius, one step tighter than the chassis. */}
        <div
          className="relative overflow-hidden bg-black"
          style={{ borderRadius: "12.4%/5.7%", padding: "1.9%" }}
        >
          {/* Layer 4 + 5 — the display. */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: "11%/5%",
              background: INK,
              containerType: "inline-size",
              aspectRatio: "282 / 610",
            }}
          >
            <div className="flex h-full flex-col">
              <StatusBar />
              <div className="relative min-h-0 flex-1">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={screen}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    {screen === 0 ? <ReleaseScreen /> : <StatusScreen />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Camera housing. */}
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: u(9),
                width: u(78),
                height: u(23),
                borderRadius: u(12),
                background: "#000",
              }}
            >
              <span
                className="absolute rounded-full"
                style={{
                  right: u(9),
                  top: u(6.5),
                  width: u(10),
                  height: u(10),
                  background:
                    "radial-gradient(circle at 35% 30%, #2B3550 0%, #0A0D16 62%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
                }}
              />
            </span>

            {/* Layer 6 — one specular sheen and a screen-edge light. Restrained
                on purpose: more reflection would fight the interface. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(128deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 16%, transparent 34%, transparent 66%, rgba(255,255,255,0.035) 100%)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: "11%/5%",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
