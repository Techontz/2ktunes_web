import { useState } from "react";
import { Send } from "lucide-react";
import { Button, Card, Tab, TabList, TabPanel, Tabs, useToast } from "@/components/ui";
import { FormAlert, LoadError, PageHeader, PageLoading, StatusPill, useAction } from "@/features/dashboard/components";
import { fetchReleaseConfig } from "@/lib/api/catalog";
import { fetchMyCreatorProfile, submitCreatorProfile } from "@/lib/api/marketplace";
import type { CreatorProfile, ReleaseConfig } from "@/lib/api/types";
import { useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "./copy";
import { IncomingOrders } from "./IncomingOrders";
import { PackagesPanel } from "./PackagesPanel";
import { PortfolioPanel } from "./PortfolioPanel";
import { AvatarUpload, ProfileForm } from "./ProfileForm";
import { SocialAccountsEditor } from "./SocialAccountsEditor";

export default function CreatorWorkspacePage() {
  const c = useCopy(COPY);
  const { refresh } = useAuth();
  const res = useResource(async (signal) => {
    const [profile, config] = await Promise.all([fetchMyCreatorProfile({ signal }), fetchReleaseConfig()]);
    return { profile, market: config.marketplace };
  }, []);

  if (res.loading) return <PageLoading />;
  if (res.error || !res.data)
    return (
      <div>
        <PageHeader title={c.title} />
        <LoadError error={res.error} onRetry={res.reload} />
      </div>
    );

  const { profile, market } = res.data;
  const setProfile = (p: CreatorProfile) => res.setData((prev) => (prev ? { ...prev, profile: p } : prev));

  if (!profile) {
    return (
      <div>
        <PageHeader title={c.startTitle} description={c.startIntro} />
        <Card className="max-w-3xl">
          <ProfileForm
            profile={null}
            categories={market.categories}
            onSaved={async (p) => {
              setProfile(p);
              await refresh();
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={c.title}
        description={c.intro}
        meta={<StatusPill status={profile.status} size="md" />}
        actions={
          profile.status === "approved" ? (
            <Button to={`/dashboard/creators/${encodeURIComponent(profile.slug)}`} variant="secondary">
              {c.viewPublic}
            </Button>
          ) : undefined
        }
      />
      <StatusBanner profile={profile} onSubmitted={res.reload} />
      <Workspace profile={profile} market={market} setProfile={setProfile} reload={res.reload} />
    </div>
  );
}

function StatusBanner({ profile, onSubmitted }: { profile: CreatorProfile; onSubmitted: () => void }) {
  const c = useCopy(COPY);
  const { toast } = useToast();
  const submit = useAction(() => submitCreatorProfile());
  const canSubmit = profile.status === "draft" || profile.status === "rejected";

  const text: Record<string, string> = {
    draft: c.statusDraft,
    pending_review: c.statusPending,
    approved: c.statusApproved,
    rejected: c.statusRejected,
    suspended: c.statusSuspended,
  };
  const tone =
    profile.status === "approved"
      ? "success"
      : profile.status === "rejected" || profile.status === "suspended"
        ? "danger"
        : profile.status === "pending_review"
          ? "warning"
          : "info";

  const run = async () => {
    const r = await submit.run();
    if (r.ok) {
      toast({ title: c.submitted, description: r.value.message, tone: "success" });
      onSubmitted();
    }
  };

  return (
    <div className="mb-8 space-y-3">
      <FormAlert tone={tone}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-semibold">{text[profile.status] ?? ""}</p>
            {profile.review_note && (profile.status === "rejected" || profile.status === "suspended") && (
              <p className="break-words">
                <span className="font-semibold">{c.reviewNote}: </span>
                {profile.review_note}
              </p>
            )}
            {canSubmit && <p className="text-caption text-text-muted">{c.submitNeeds}</p>}
          </div>
          {canSubmit && (
            <Button size="sm" leftIcon={<Send />} loading={submit.pending} onClick={run}>
              {c.submit}
            </Button>
          )}
        </div>
      </FormAlert>
      {submit.error && <FormAlert>{submit.error}</FormAlert>}
    </div>
  );
}

function Workspace({
  profile,
  market,
  setProfile,
  reload,
}: {
  profile: CreatorProfile;
  market: ReleaseConfig["marketplace"];
  setProfile: (p: CreatorProfile) => void;
  reload: () => void;
}) {
  const c = useCopy(COPY);
  const [tab, setTab] = useState("profile");
  return (
    <Tabs value={tab} onValueChange={setTab} variant="underline">
      <TabList aria-label={c.tabsLabel} className="mb-6">
        <Tab value="profile">{c.tabProfile}</Tab>
        <Tab value="social">{c.tabSocial}</Tab>
        <Tab value="packages">{c.tabPackages}</Tab>
        <Tab value="portfolio">{c.tabPortfolio}</Tab>
        <Tab value="orders">{c.tabOrders}</Tab>
      </TabList>
      <TabPanel value="profile">
        <Card className="space-y-6">
          <AvatarUpload profile={profile} onSaved={setProfile} />
          <div className="border-t border-border-subtle pt-6">
            <ProfileForm key={profile.id} profile={profile} categories={market.categories} onSaved={setProfile} />
          </div>
        </Card>
      </TabPanel>
      <TabPanel value="social">
        <SocialAccountsEditor profile={profile} platforms={market.platforms} onSaved={setProfile} />
      </TabPanel>
      <TabPanel value="packages">
        <PackagesPanel profile={profile} market={market} onChanged={reload} />
      </TabPanel>
      <TabPanel value="portfolio">
        <PortfolioPanel profile={profile} platforms={market.platforms} onChanged={reload} />
      </TabPanel>
      <TabPanel value="orders">
        <IncomingOrders />
      </TabPanel>
    </Tabs>
  );
}
