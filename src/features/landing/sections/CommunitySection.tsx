import { COVERS } from "../data";
import CoverArt from "../art/CoverArt";
import { Band, Pill, Reveal } from "../ui";

const CITIES = [
  "Dar es Salaam",
  "Nairobi",
  "Kampala",
  "Kigali",
  "Mwanza",
  "Arusha",
  "Zanzibar",
  "Lagos",
  "Accra",
  "Johannesburg",
];

/** The wall alternates squares and circles so the rail reads as a collage. */
const RAIL = [...COVERS, ...COVERS];

export default function CommunitySection() {
  return (
    <Band tone="clay" className="py-20 md:py-28 lg:py-32">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="t-eyebrow mb-6 text-bone/45">The community</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="t-display text-bone">
              Built for the artists
              <br className="hidden sm:block" /> shaping Africa&rsquo;s sound.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="t-body mx-auto mt-6 max-w-[52ch] text-bone/65">
              Bongo flava, amapiano, afrobeats, singeli, taarab, gengetone,
              gospel and everything being invented right now in a bedroom studio
              somewhere. 2K Tunes exists to get that music out of the city it was
              made in.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-10">
              <Pill to="/auth" variant="light" size="lg">
                Join 2K Tunes
              </Pill>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Full-bleed catalogue wall */}
      <Reveal delay={0.1} className="mt-16 md:mt-20">
        <div className="fade-x overflow-hidden">
          {/* pb leaves room for the staggered tiles so captions never clip. */}
          <div className="animate-rail flex w-max gap-4 pb-6 md:gap-5">
            {RAIL.map((cover, i) => {
              const circle = i % 3 === 2;
              return (
                <div
                  key={`${cover.id}-${i}`}
                  className={`h-36 w-36 shrink-0 overflow-hidden sm:h-44 sm:w-44 md:h-52 md:w-52 ${
                    circle ? "rounded-full" : "rounded-[22px]"
                  }`}
                  style={{
                    transform: `translateY(${i % 2 === 0 ? "0px" : "18px"})`,
                  }}
                >
                  <CoverArt cover={cover} caption={!circle} />
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div className="shell">
        <Reveal delay={0.14}>
          <ul className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:mt-20">
            {CITIES.map((city, i) => (
              <li key={city} className="flex items-center gap-6">
                <span className="t-eyebrow text-bone/40">{city}</span>
                {i < CITIES.length - 1 && (
                  <span className="hidden h-1 w-1 rounded-full bg-bone/25 sm:block" />
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Band>
  );
}
