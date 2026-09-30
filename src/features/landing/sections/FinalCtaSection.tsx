import { Band, Pill, Reveal } from "../ui";

export default function FinalCtaSection() {
  return (
    <Band tone="volt" className="grain py-24 md:py-28 lg:py-32">
      {/* One oversized geometric breath — no floating shapes, just light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 62%)",
        }}
      />

      <div className="shell relative text-center">
        <Reveal>
          <h2 className="t-display mx-auto max-w-[22ch] text-white">
            Ready to take your music global?
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="t-body mx-auto mt-7 max-w-[46ch] text-white/75">
            Set up an artist account, upload your first release, and take your
            sound to every platform that matters.
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-11 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Pill to="/auth" variant="light" size="lg" className="sm:px-10">
              Get started
            </Pill>
            <Pill href="#pricing" variant="outlineLight" size="lg">
              Explore plans
            </Pill>
          </div>
        </Reveal>
      </div>
    </Band>
  );
}
