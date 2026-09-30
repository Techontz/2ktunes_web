import { COVERS } from "../data";
import CoverArt from "../art/CoverArt";
import { Band, Card, Eyebrow, Reveal } from "../ui";

const CONTROLS = [
  {
    t: "You keep your masters",
    d: "2K Tunes distributes your music. It never takes ownership of it.",
  },
  {
    t: "You choose the release date",
    d: "Schedule, delay or take a release down. Your catalogue answers to you.",
  },
  {
    t: "You control the catalogue",
    d: "Singles, EPs, albums, features and re-releases, all managed in one place.",
  },
  {
    t: "You split fairly",
    d: "Assign percentages to producers, features and co-writers up front.",
  },
  {
    t: "You see the numbers",
    d: "Streams, territories and royalties, reported per release and per store.",
  },
  {
    t: "You can leave",
    d: "No lock-in on your rights. Your career does not become someone else's asset.",
  },
];

/**
 * Ownership reads differently from the bento sections on purpose: the headline
 * lives inside a full-bleed clay block, set against a black content column.
 */
export default function OwnershipSection() {
  return (
    <Band id="ownership" tone="bone">
      <div className="shell">
        <div className="grid gap-4 md:gap-5 lg:grid-cols-12">
          {/* Statement block */}
          <Reveal className="lg:col-span-5">
            <Card className="grain relative flex h-full min-h-[26rem] flex-col justify-between bg-clay p-8 sm:p-10 lg:min-h-[34rem]">
              <div className="relative">
                <Eyebrow className="text-white/60">Ownership</Eyebrow>
                <h2 className="t-display mt-6 text-white">
                  Your music.
                  <br />
                  Your rights.
                  <br />
                  Your career.
                </h2>
              </div>

              <div className="relative mt-10">
                <p className="t-body max-w-[32ch] text-white/80">
                  Distribution should be a service you hire, not a deal you sign
                  away your work to.
                </p>
                <div className="mt-8 flex items-end gap-3">
                  <span className="t-figure leading-none text-white">100%</span>
                  <span className="pb-1 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-white/70">
                    master rights
                    <br />
                    stay with you
                  </span>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Control list */}
          <Reveal delay={0.08} className="lg:col-span-7">
            <Card className="flex h-full flex-col bg-ink p-8 sm:p-10">
              <Eyebrow className="text-white/35">What you control</Eyebrow>
              <ul className="mt-8 grid flex-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                {CONTROLS.map((c, i) => (
                  <li key={c.t}>
                    <span className="t-eyebrow block text-volt-lit">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-[1.0625rem] font-extrabold tracking-[-0.02em] text-white">
                      {c.t}
                    </h3>
                    <p className="mt-1.5 text-[0.875rem] font-medium leading-relaxed text-white/45">
                      {c.d}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Catalogue strip — a quiet reminder that this is about records. */}
              <div className="fade-x mt-10 w-full overflow-hidden">
                <div className="animate-rail flex w-max gap-3">
                  {[...COVERS.slice(0, 9), ...COVERS.slice(0, 9)].map((c, i) => (
                    <div
                      key={`${c.id}-${i}`}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg opacity-80"
                    >
                      <CoverArt cover={c} caption={false} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </Band>
  );
}
