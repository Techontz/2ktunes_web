import { ArrowRight, Check, Disc3, Globe2, Languages, Megaphone, Play, PlayCircle, Users, Wallet } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { HOME } from "../content/home";
import { MOCKS } from "../content/mocks";
import ReleaseCover from "../art/ReleaseCover";
import { FEATURED_RELEASE } from "../art/release";
import {
  Band,
  Checklist,
  CtaBand,
  Faq,
  ArtistPhoto,
  EqBars,
  FeatureGrid,
  Orbs,
  Reveal,
  SectionHeader,
  Split,
  TextLink,
  useMuted,
} from "../kit";
import { PlanCards } from "../PlanCards";
import { StoreMarquee, StoreWall } from "../StoreWall";
import { AnalyticsMock, CampaignMock, SplitsMock, WalletMock } from "../visuals";
import { usePageMeta } from "../usePageMeta";

const PROMISE_ICONS = [<Globe2 key="g" />, <Megaphone key="m" />, <Wallet key="w" />];
const AFRICA_ICONS = [<Disc3 key="d" />, <Languages key="l" />, <Users key="u" />];

function Hero() {
  const { t, pick } = useLanguage();
  const c = pick(HOME).hero;
  const m = pick(MOCKS);
  return (
    <section className="theme-dark bg-hero relative overflow-hidden pt-24 text-text md:pt-32">
      <Orbs />
      <div className="shell relative grid items-center gap-10 pb-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:pb-20">
        <div className="min-w-0 animate-slide-up">
          <p className="mb-6 inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-tint/[0.06] py-1.5 pl-2 pr-4 text-[0.8125rem] font-semibold text-text-muted backdrop-blur">
            <span aria-hidden className="h-2 w-2 shrink-0 animate-pulse-ring rounded-full bg-lime" />
            <span className="min-w-0 truncate">{c.eyebrow}</span>
          </p>
          <h1 className="t-hero">
            {c.lines.map((line, i) => (
              <span key={line} className={cn("block", i === 2 && "text-brand-gradient")}>
                {line}
              </span>
            ))}
          </h1>
          <p className="t-lead mt-6 max-w-[36rem] text-text-muted">{c.lede}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/auth?mode=register" size="lg" shape="pill" rightIcon={<ArrowRight />}>
              {t("cta.release")}
            </Button>
            <Button href="#how-it-works" variant="outline" size="lg" shape="pill" leftIcon={<PlayCircle />}>
              {c.secondary}
            </Button>
          </div>
          <ul className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {c.trust.map((item) => (
              <li key={item} className="flex items-center gap-2 text-body-sm text-text-muted">
                <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Artist collage — the owner's own photography; decorative. */}
        <div aria-hidden className="relative mx-auto h-[23rem] w-full max-w-[34rem] sm:h-[30rem] lg:h-[34rem] lg:max-w-none">
          <div className="absolute left-0 top-[12%] h-[62%] w-[36%] rotate-[-7deg] overflow-hidden rounded-[22px] border border-white/15 shadow-overlay animate-float-slow">
            <ArtistPhoto id={2} eager sizes="(min-width: 1024px) 14rem, 36vw" position="50% 20%" />
          </div>
          <div className="absolute right-0 top-[6%] h-[60%] w-[36%] rotate-[6deg] overflow-hidden rounded-[22px] border border-white/15 shadow-overlay animate-float-slow [animation-delay:-5s]">
            <ArtistPhoto id={5} eager sizes="(min-width: 1024px) 14rem, 36vw" position="50% 30%" />
          </div>
          <div className="absolute left-1/2 top-0 h-[86%] w-[50%] -translate-x-1/2 overflow-hidden rounded-[28px] border-2 border-white/25 shadow-[0_40px_80px_-30px_rgb(8_2_16/0.9)]">
            <div className="h-full w-full animate-float [animation-duration:11s]">
              <ArtistPhoto id={1} eager sizes="(min-width: 1024px) 18rem, 50vw" position="50% 18%" className="scale-[1.06]" />
            </div>
            <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgb(26_11_46/0.85))]" />
            <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                <Play className="ml-0.5 h-3 w-3 fill-current" />
              </span>
              <EqBars bars={8} className="h-4 text-white" />
            </span>
          </div>
          <div className="absolute bottom-[4%] left-[2%] flex w-[15.5rem] max-w-[70%] items-center gap-3 rounded-card border border-white/15 bg-[#2a1248]/85 p-2.5 shadow-overlay backdrop-blur-md animate-float [animation-delay:-3s] sm:left-[6%]">
            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-[10px]">
              <ReleaseCover size="thumb" alt="" eager />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-sm font-bold text-white">{FEATURED_RELEASE.title}</span>
              <span className="block truncate text-caption text-text-subtle">{FEATURED_RELEASE.artist}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {m.release.statusLive}
            </span>
          </div>
          <div className="absolute bottom-[14%] right-[1%] hidden items-center gap-2 rounded-full border border-white/15 bg-[#2a1248]/85 py-2 pl-2 pr-3.5 shadow-overlay backdrop-blur-md animate-float [animation-delay:-6s] sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange text-night">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <span className="text-caption font-semibold text-white">M-Pesa · Airtel · Mixx</span>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-night/40 py-5 backdrop-blur-sm">
        <StoreMarquee />
      </div>
    </section>
  );
}

function Promises() {
  const { pick } = useLanguage();
  const promises = pick(HOME).promises;
  return (
    <section className="relative bg-white py-14 md:py-20">
      <ul className="shell grid gap-4 md:grid-cols-3">
        {promises.map((p, i) => (
          <Reveal
            as="li"
            key={p.title}
            delay={i * 90}
            className="group lift relative overflow-hidden rounded-card border border-border-subtle bg-surface-raised p-6 shadow-card-light md:p-7"
          >
            <span aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-soft transition-transform duration-500 group-hover:scale-150" />
            <span
              aria-hidden
              className="relative flex h-12 w-12 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#9e4fe0,#6e16a8)] text-white shadow-[0_10px_22px_-10px_rgb(132_29_198/0.8)] [&>svg]:h-5 [&>svg]:w-5"
            >
              {PROMISE_ICONS[i]}
            </span>
            <h2 className="relative mt-5 t-card">{p.title}</h2>
            <p className="t-body relative mt-2 text-text-muted">{p.body}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Workflow() {
  const { pick } = useLanguage();
  const c = pick(HOME).workflow;
  return (
    <Band tone="raised" id="how-it-works" labelledBy="how-title">
      <div className="shell">
        <SectionHeader id="how-title" eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
        <WorkflowSteps steps={c.steps} />
      </div>
    </Band>
  );
}

/** Rendered inside the Band so it reads the light tone from context. */
function WorkflowSteps({ steps }: { steps: { title: string; body: string }[] }) {
  const { muted, card } = useMuted();
  return (
    <ol className="relative mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <span aria-hidden className="absolute left-8 right-8 top-[2.6rem] hidden h-px bg-[linear-gradient(90deg,transparent,rgb(132_29_198/0.35),transparent)] lg:block" />
      {steps.map((s, i) => (
        <Reveal
          as="li"
          key={s.title}
          delay={i * 90}
          className={cn("lift relative flex min-w-0 gap-4 rounded-card p-5 sm:flex-col sm:gap-0", card)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#9e4fe0,#6e16a8)] text-[0.8125rem] font-bold tabular-nums text-white shadow-[0_8px_18px_-8px_rgb(132_29_198/0.8)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3 className="text-[1.1875rem] font-bold tracking-[-0.02em] sm:mt-5">{s.title}</h3>
            <p className={cn("mt-1.5 text-body-sm sm:mt-2", muted)}>{s.body}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

function Promotion() {
  const { pick } = useLanguage();
  const c = pick(HOME).promotion;
  return (
    <Band tone="dark" labelledBy="promo-title">
      <Split visual={<CampaignMock className="mx-auto max-w-[30rem] lg:max-w-none" />}>
        <SectionHeader id="promo-title" eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
        <p className="mt-6 max-w-[34rem] rounded-r-[10px] border-l-2 border-accent-text bg-tint/[0.05] py-3 pl-4 pr-3 text-body text-text-muted">
          {c.note}
        </p>
        <TextLink to="/promotion" className="mt-7">
          {c.link}
        </TextLink>
      </Split>
      <div className="shell mt-14">
        <FeatureGrid
          columns={4}
          items={c.kinds.map((k) => ({
            title: k.title,
            body: k.body,
            tag: <Badge tone="accent" size="sm">{k.tag}</Badge>,
          }))}
        />
      </div>
    </Band>
  );
}

function Royalties() {
  const { pick } = useLanguage();
  const c = pick(HOME).royalties;
  return (
    <Band tone="raised" labelledBy="roy-title">
      <Split reverse visual={<WalletMock className="mx-auto max-w-[30rem] lg:max-w-none" />}>
        <SectionHeader id="roy-title" eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
        <dl className="mt-8 space-y-5">
          {c.points.map((p) => (
            <div key={p.title} className="border-t border-border-subtle pt-5">
              <dt className="text-[1.0625rem] font-semibold">{p.title}</dt>
              <dd className="t-body mt-1 text-text-muted">{p.body}</dd>
            </div>
          ))}
        </dl>
        <TextLink to="/royalties" className="mt-8">
          {c.link}
        </TextLink>
      </Split>
    </Band>
  );
}

function Splits() {
  const { pick } = useLanguage();
  const c = pick(HOME).splits;
  return (
    <Band tone="light" labelledBy="splits-title">
      <Split visual={<SplitsMock className="mx-auto max-w-[28rem] lg:max-w-none" />}>
        <SectionHeader id="splits-title" eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
        <Checklist items={c.points} className="mt-8" />
      </Split>
    </Band>
  );
}

function Analytics() {
  const { pick } = useLanguage();
  const c = pick(HOME).analytics;
  return (
    <Band tone="raised" labelledBy="an-title">
      <Split reverse visual={<AnalyticsMock className="mx-auto max-w-[28rem] lg:max-w-none" />}>
        <SectionHeader id="an-title" eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
        <Checklist items={c.points} className="mt-8" />
      </Split>
    </Band>
  );
}

export default function HomePage() {
  const { t, pick } = useLanguage();
  const c = pick(HOME);
  usePageMeta(null, c.hero.lede);

  return (
    <>
      <Hero />
      <Promises />

      <Band tone="light" labelledBy="stores-title">
        <div className="shell">
          <SectionHeader id="stores-title" eyebrow={c.stores.eyebrow} title={c.stores.title} lede={c.stores.lede} />
          <StoreWall className="mt-12" />
        </div>
      </Band>

      <Workflow />
      <Promotion />
      <Royalties />
      <Splits />
      <Analytics />

      <Band tone="dark" labelledBy="africa-title">
        <ArtistStrip />
        <div className="shell mt-14 md:mt-16">
          <SectionHeader id="africa-title" eyebrow={c.africa.eyebrow} title={c.africa.title} lede={c.africa.lede} />
          <FeatureGrid
            className="mt-12"
            items={c.africa.points.map((p, i) => ({ ...p, icon: AFRICA_ICONS[i] }))}
          />
        </div>
      </Band>

      <Band tone="light" labelledBy="pricing-title">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader id="pricing-title" eyebrow={c.pricing.eyebrow} title={c.pricing.title} lede={c.pricing.lede} />
            <TextLink to="/pricing" className="shrink-0">
              {c.pricing.link}
            </TextLink>
          </div>
          <div className="mt-12">
            <PlanCards />
          </div>
        </div>
      </Band>

      <Band tone="raised" labelledBy="faq-title">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <SectionHeader id="faq-title" eyebrow={c.faq.eyebrow} title={c.faq.title} />
            <TextLink to="/help" className="mt-6">
              {c.faq.link}
            </TextLink>
          </div>
          <Faq items={c.faq.items} />
        </div>
      </Band>

      <CtaBand title={c.final.title} lede={c.final.lede} secondary={{ label: t("cta.see_pricing"), to: "/pricing" }} />
    </>
  );
}

/** A row of the owner's artist photography (decorative, staggered heights). */
function ArtistStrip() {
  const ids = [2, 1, 5, 3, 4] as const;
  return (
    <div aria-hidden className="shell">
      <div className="grid grid-cols-3 items-end gap-3 sm:grid-cols-5 sm:gap-4">
        {ids.map((id, i) => (
          <Reveal
            key={id}
            delay={i * 80}
            className={cn(
              "group relative overflow-hidden rounded-[20px] border border-white/10 shadow-overlay",
              ["h-48 sm:h-64", "h-56 sm:h-80", "h-44 sm:h-60", "hidden h-56 sm:block sm:h-72", "hidden h-48 sm:block sm:h-64"][i],
            )}
          >
            <ArtistPhoto
              id={id}
              sizes="(min-width: 640px) 20vw, 33vw"
              position="50% 22%"
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(26_11_46/0.75))]" />
            <EqBars bars={6} className="absolute bottom-3 left-3 h-4 text-white/85" />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
