import type { ReactNode } from "react";
import {
  BarChart3,
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  Disc3,
  FileCheck2,
  Globe2,
  Handshake,
  Headphones,
  Languages,
  Layers,
  ListMusic,
  Megaphone,
  PieChart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Users,
  Video,
  Wallet,
  Landmark,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, DataTable } from "@/components/ui";
import { useLanguage, type Localized } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Band,
  Checklist,
  CtaBand,
  Faq,
  FeatureGrid,
  HERO_PHOTOS,
  PageHero,
  Reveal,
  SectionHeader,
  Split,
  TextLink,
  useMuted,
  type Tone,
} from "./kit";
import { PlanCards } from "./PlanCards";
import { StoreWall } from "./StoreWall";
import { AnalyticsMock, CampaignMock, ReleaseMock, SplitsMock, WalletMock } from "./visuals";
import { usePageMeta } from "./usePageMeta";

/**
 * Content-driven page renderer for the marketing site. Each inner page is a
 * `Localized<PageCopy>` object plus one line of JSX, which keeps every page on
 * the same grid, type scale and band rhythm.
 */

export const ICONS = {
  globe: Globe2,
  disc: Disc3,
  file: FileCheck2,
  calendar: CalendarClock,
  chart: BarChart3,
  shield: ShieldCheck,
  wallet: Wallet,
  bank: Landmark,
  phone: Smartphone,
  pie: PieChart,
  megaphone: Megaphone,
  video: Video,
  list: ListMusic,
  users: Users,
  sparkles: Sparkles,
  timer: Timer,
  handshake: Handshake,
  headphones: Headphones,
  languages: Languages,
  layers: Layers,
  dollar: CircleDollarSign,
  badge: BadgeCheck,
} satisfies Record<string, LucideIcon>;
export type IconName = keyof typeof ICONS;

type Item = { icon?: IconName; title: string; body: string; tag?: string };
type Visual = "release" | "wallet" | "splits" | "campaign" | "analytics";

export type Section =
  | { type: "features"; tone?: Tone; eyebrow?: string; title: string; lede?: string; items: Item[]; columns?: 2 | 3 | 4 }
  | {
      type: "split";
      tone?: Tone;
      eyebrow?: string;
      title: string;
      lede?: string;
      points?: string[];
      visual: Visual;
      reverse?: boolean;
      link?: { label: string; to: string };
      note?: string;
    }
  | { type: "stores"; tone?: Tone; eyebrow?: string; title: string; lede?: string }
  | { type: "steps"; tone?: Tone; eyebrow?: string; title: string; lede?: string; steps: { title: string; body: string }[] }
  | { type: "faq"; tone?: Tone; eyebrow?: string; title: string; items: { q: string; a: string }[]; link?: { label: string; to: string } }
  | {
      type: "compare";
      tone?: Tone;
      eyebrow?: string;
      title: string;
      lede?: string;
      caption: string;
      headers: [string, string, string, string];
      rows: { name: string; what: string; who: string; guaranteed: string }[];
      note?: string;
    }
  | { type: "plans"; tone?: Tone; eyebrow?: string; title: string; lede?: string }
  | { type: "prose"; tone?: Tone; eyebrow?: string; title: string; paragraphs: string[]; aside?: { label: string; value: string }[] }
  | { type: "notice"; tone?: Tone; title: string; body: string };

export type PageCopy = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    secondary?: { label: string; to: string };
    visual?: Visual;
  };
  sections: Section[];
  cta: { title: string; lede?: string; secondary?: { label: string; to: string } };
};

function renderVisual(v: Visual, eager?: boolean): ReactNode {
  const cls = "mx-auto w-full max-w-[30rem] lg:max-w-none";
  switch (v) {
    case "release":
      return <ReleaseMock className={cls} eager={eager} />;
    case "wallet":
      return <WalletMock className={cls} />;
    case "splits":
      return <SplitsMock className={cls} />;
    case "campaign":
      return <CampaignMock className={cls} />;
    case "analytics":
      return <AnalyticsMock className={cls} />;
  }
}

const iconNode = (name?: IconName) => {
  if (!name) return undefined;
  const Icon = ICONS[name];
  return <Icon />;
};

function Compare({ s }: { s: Extract<Section, { type: "compare" }> }) {
  const { muted } = useMuted();
  return (
    <>
      <DataTable
        className="mt-12"
        caption={s.caption}
        rows={s.rows}
        getRowKey={(r) => r.name}
        columns={[
          { key: "name", header: s.headers[0], primary: true, cell: (r) => <span className="font-semibold">{r.name}</span> },
          { key: "what", header: s.headers[1], cell: (r) => <span className="text-text-muted">{r.what}</span> },
          { key: "who", header: s.headers[2], cell: (r) => <span className="text-text-muted">{r.who}</span> },
          { key: "guaranteed", header: s.headers[3], cell: (r) => <span className="font-semibold text-text">{r.guaranteed}</span> },
        ]}
      />
      {s.note && <p className={cn("mt-5 max-w-[60ch] text-body-sm", muted)}>{s.note}</p>}
    </>
  );
}

function Prose({ s }: { s: Extract<Section, { type: "prose" }> }) {
  const { muted, line } = useMuted();
  return (
    <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20">
      <div>
        <SectionHeader eyebrow={s.eyebrow} title={s.title} />
        <div className={cn("mt-8 space-y-5 t-body max-w-[62ch]", muted)}>
          {s.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
      {s.aside && (
        <dl className="self-end">
          {s.aside.map((a) => (
            <div key={a.label} className={cn("border-t py-5", line)}>
              <dt className={cn("text-body-sm", muted)}>{a.label}</dt>
              <dd className="mt-1 text-[1.375rem] font-bold tracking-[-0.02em]">{a.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Notice({ s }: { s: Extract<Section, { type: "notice" }> }) {
  const { muted, card } = useMuted();
  return (
    <div className="shell">
      <div className={cn("flex flex-col gap-4 rounded-card p-6 sm:flex-row sm:p-8", card)}>
        <ShieldCheck aria-hidden className="h-6 w-6 shrink-0 text-accent-text" />
        <div>
          <h2 className="t-card">{s.title}</h2>
          <p className={cn("t-body mt-2 max-w-[70ch]", muted)}>{s.body}</p>
        </div>
      </div>
    </div>
  );
}

function SectionView({ s, index }: { s: Section; index: number }) {
  const fallbackTone: Tone = (["raised", "light", "dark"] as const)[index % 3];
  const tone = s.tone ?? fallbackTone;
  const id = `s${index}-title`;
  switch (s.type) {
    case "features":
      return (
        <Band tone={tone} labelledBy={id}>
          <div className="shell">
            <SectionHeader id={id} eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
            <FeatureGrid
              className="mt-12"
              columns={s.columns ?? 3}
              items={s.items.map((it) => ({
                icon: iconNode(it.icon),
                title: it.title,
                body: it.body,
                tag: it.tag ? <Badge tone="accent" size="sm">{it.tag}</Badge> : undefined,
              }))}
            />
          </div>
        </Band>
      );
    case "split":
      return (
        <Band tone={tone} labelledBy={id}>
          <Split reverse={s.reverse} visual={renderVisual(s.visual)}>
            <SectionHeader id={id} eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
            {s.points && <Checklist items={s.points} className="mt-8" />}
            {s.note && <SplitNote>{s.note}</SplitNote>}
            {s.link && (
              <TextLink to={s.link.to} className="mt-8">
                {s.link.label}
              </TextLink>
            )}
          </Split>
        </Band>
      );
    case "stores":
      return (
        <Band tone={tone} labelledBy={id}>
          <div className="shell">
            <SectionHeader id={id} eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
            <StoreWall className="mt-12" />
          </div>
        </Band>
      );
    case "steps":
      return (
        <Band tone={tone} labelledBy={id}>
          <div className="shell">
            <SectionHeader id={id} eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
            <Steps steps={s.steps} />
          </div>
        </Band>
      );
    case "faq":
      return (
        <Band tone={tone} labelledBy={id}>
          <div className="shell grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <SectionHeader id={id} eyebrow={s.eyebrow} title={s.title} size="title" />
              {s.link && (
                <TextLink to={s.link.to} className="mt-6">
                  {s.link.label}
                </TextLink>
              )}
            </div>
            <Faq items={s.items} />
          </div>
        </Band>
      );
    case "compare":
      return (
        <Band tone={tone === "light" ? "raised" : tone} labelledBy={id}>
          <div className="shell">
            <SectionHeader id={id} eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
            <Compare s={s} />
          </div>
        </Band>
      );
    case "plans":
      return (
        <Band tone={tone} labelledBy={id}>
          <div className="shell">
            <SectionHeader id={id} eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
            <div className="mt-12">
              <PlanCards />
            </div>
          </div>
        </Band>
      );
    case "prose":
      return (
        <Band tone={tone}>
          <Prose s={s} />
        </Band>
      );
    case "notice":
      return (
        <Band tone={tone} className="!py-12 md:!py-16">
          <Notice s={s} />
        </Band>
      );
  }
}

function SplitNote({ children }: { children: ReactNode }) {
  const { muted } = useMuted();
  return (
    <p className={cn("mt-6 rounded-r-[10px] border-l-2 border-accent-text bg-tint/[0.05] py-3 pl-4 pr-3 text-body-sm", muted)}>
      {children}
    </p>
  );
}

function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  const { muted, card } = useMuted();
  return (
    <ol
      className={cn(
        "mt-12 grid gap-3 sm:grid-cols-2",
        steps.length === 4 && "lg:grid-cols-4",
        steps.length === 5 && "lg:grid-cols-5",
        steps.length === 3 && "lg:grid-cols-3",
      )}
    >
      {steps.map((st, i) => (
        <Reveal
          as="li"
          key={st.title}
          delay={i * 80}
          className={cn("lift flex min-w-0 gap-4 rounded-card p-5 sm:flex-col sm:gap-0", card)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#9e4fe0,#6e16a8)] text-[0.8125rem] font-bold tabular-nums text-white shadow-[0_8px_18px_-8px_rgb(132_29_198/0.8)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3 className="text-[1.125rem] font-bold tracking-[-0.02em] sm:mt-5">{st.title}</h3>
            <p className={cn("mt-1.5 text-body-sm sm:mt-2", muted)}>{st.body}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/** Stable artist photo per page (same page → same photo, across languages it may differ, which is fine). */
function heroPhotoIndex(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % HERO_PHOTOS.length;
}

export function MarketingPage({ content }: { content: Localized<PageCopy> }) {
  const { t, pick } = useLanguage();
  const c = pick(content);
  usePageMeta(c.meta.title, c.meta.description);

  return (
    <>
      <PageHero
        photo={HERO_PHOTOS[heroPhotoIndex(c.meta.title)]}
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        lede={c.hero.lede}
        aside={c.hero.visual ? renderVisual(c.hero.visual, true) : undefined}
        actions={
          <>
            <Button to="/auth?mode=register" size="lg" shape="pill" rightIcon={<ArrowRight />}>
              {t("cta.release")}
            </Button>
            {c.hero.secondary && (
              <Button to={c.hero.secondary.to} variant="outline" size="lg" shape="pill">
                {c.hero.secondary.label}
              </Button>
            )}
          </>
        }
      />
      {c.sections.map((s, i) => (
        <SectionView key={i} s={s} index={i} />
      ))}
      <CtaBand title={c.cta.title} lede={c.cta.lede} secondary={c.cta.secondary} />
    </>
  );
}
