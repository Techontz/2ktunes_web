import { Check, Disc3, Globe2, Languages, Megaphone, Users, Wallet } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { HOME } from "../content/home";
import {
  Band,
  Checklist,
  CtaBand,
  Faq,
  FeatureGrid,
  SectionHeader,
  Split,
  TextLink,
  useMuted,
} from "../kit";
import { PlanCards } from "../PlanCards";
import { StoreWall } from "../StoreWall";
import { AnalyticsMock, CampaignMock, ReleaseMock, SplitsMock, WalletMock } from "../visuals";
import { usePageMeta } from "../usePageMeta";

const PROMISE_ICONS = [<Globe2 key="g" />, <Megaphone key="m" />, <Wallet key="w" />];
const AFRICA_ICONS = [<Disc3 key="d" />, <Languages key="l" />, <Users key="u" />];

function Hero() {
  const { t, pick } = useLanguage();
  const c = pick(HOME).hero;
  const promises = pick(HOME).promises;
  return (
    <section className="relative overflow-hidden bg-surface pb-16 pt-28 md:pb-24 md:pt-36">
      {/* One quiet light source; no gradients on text, no glow on controls. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(109,43,255,0.16), transparent 65%)" }}
      />
      <div className="shell relative grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <div className="min-w-0">
          <p className="t-eyebrow mb-5 flex items-center gap-2 text-text-muted">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime" />
            {c.eyebrow}
          </p>
          <h1 className="t-hero">
            {c.lines.map((line, i) => (
              <span key={line} className={cn("block", i === 2 && "text-accent-text")}>
                {line}
              </span>
            ))}
          </h1>
          <p className="t-lead mt-6 max-w-[36rem] text-text-muted">{c.lede}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/auth?mode=register" size="lg" shape="pill">
              {t("cta.release")}
            </Button>
            <Button href="#how-it-works" variant="outline" size="lg" shape="pill">
              {c.secondary}
            </Button>
          </div>
          <ul className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {c.trust.map((item) => (
              <li key={item} className="flex items-center gap-2 text-body-sm text-text-muted">
                <Check aria-hidden className="h-4 w-4 shrink-0 text-lime" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <ReleaseMock eager className="mx-auto w-full max-w-[28rem] lg:mx-0 lg:max-w-none" />
      </div>

      <div className="shell relative mt-16 md:mt-24">
        <ul className="grid gap-px overflow-hidden rounded-card border border-border-subtle bg-border-subtle md:grid-cols-3">
          {promises.map((p, i) => (
            <li key={p.title} className="bg-surface p-6 md:p-7">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-control bg-accent-soft text-accent-text [&>svg]:h-5 [&>svg]:w-5"
              >
                {PROMISE_ICONS[i]}
              </span>
              <h2 className="mt-5 t-card">{p.title}</h2>
              <p className="t-body mt-2 text-text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Workflow() {
  const { pick } = useLanguage();
  const c = pick(HOME).workflow;
  return (
    <Band tone="light" id="how-it-works" labelledBy="how-title">
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
    <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((s, i) => (
        <li key={s.title} className={cn("relative flex min-w-0 gap-4 rounded-card p-5 sm:flex-col sm:gap-0", card)}>
          <span className="pt-1 text-[0.8125rem] font-bold tabular-nums text-volt sm:pt-0">{String(i + 1).padStart(2, "0")}</span>
          <div className="min-w-0">
            <h3 className="text-[1.1875rem] font-bold tracking-[-0.02em] sm:mt-6">{s.title}</h3>
            <p className={cn("mt-1.5 text-body-sm sm:mt-2", muted)}>{s.body}</p>
          </div>
        </li>
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
        <p className="mt-6 max-w-[34rem] border-l-2 border-accent-text pl-4 text-body text-text-muted">
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
    <Band tone="dark" labelledBy="an-title">
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

      <Band tone="raised" labelledBy="stores-title">
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

      <Band tone="raised" labelledBy="africa-title">
        <div className="shell">
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
            <PlanCards compact />
          </div>
        </div>
      </Band>

      <Band tone="dark" labelledBy="faq-title">
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
