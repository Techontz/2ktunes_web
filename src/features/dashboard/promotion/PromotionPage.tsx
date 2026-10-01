import { useSearchParams } from "react-router-dom";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui";
import { PageHeader } from "@/features/dashboard/components";
import { useCopy } from "@/lib/useCopy";
import { CampaignsTab } from "./CampaignsTab";
import { COPY } from "./copy";
import { ServicesTab } from "./ServicesTab";
import { SmartLinksTab } from "./SmartLinksTab";

const TABS = ["links", "campaigns", "services"] as const;
type TabKey = (typeof TABS)[number];

export default function PromotionPage() {
  const c = useCopy(COPY);
  const [sp, setSp] = useSearchParams();
  const raw = sp.get("tab");
  const tab: TabKey = (TABS as readonly string[]).includes(raw ?? "") ? (raw as TabKey) : "links";

  const select = (v: string) => {
    const next = new URLSearchParams(sp);
    if (v === "links") next.delete("tab");
    else next.set("tab", v);
    setSp(next, { replace: true });
  };

  return (
    <div>
      <PageHeader title={c.title} description={c.intro} />
      <Tabs value={tab} onValueChange={select} variant="underline">
        <TabList aria-label={c.tabsLabel} className="mb-6">
          <Tab value="links">{c.tabLinks}</Tab>
          <Tab value="campaigns">{c.tabCampaigns}</Tab>
          <Tab value="services">{c.tabServices}</Tab>
        </TabList>
        <TabPanel value="links">
          <SmartLinksTab />
        </TabPanel>
        <TabPanel value="campaigns">
          <CampaignsTab />
        </TabPanel>
        <TabPanel value="services">
          <ServicesTab />
        </TabPanel>
      </Tabs>
    </div>
  );
}
