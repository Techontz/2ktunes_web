import type { Localized } from "@/lib/LanguageContext";
import type { PageCopy } from "../MarketingPage";

export const CREATORS: Localized<PageCopy> = {
  EN: {
    meta: {
      title: "Creators",
      description: "Get paid to feature new African music in your content, or run creator campaigns for your release.",
    },
    hero: {
      eyebrow: "Creator campaigns",
      title: "Where new songs meet the people who make them trend.",
      lede: "Artists brief a campaign. Creators pick the songs that suit their content, post, and get paid through 2kTunes — to mobile money or bank, in shillings.",
      secondary: { label: "How promotion works", to: "/promotion" },
      visual: "campaign",
    },
    sections: [
      {
        type: "steps",
        tone: "raised",
        eyebrow: "For artists",
        title: "Run a campaign in four steps.",
        steps: [
          { title: "Write the brief", body: "Pick the song and the moment — a hook, a dance, a mood — and the countries you want to reach." },
          { title: "Set the budget", body: "Choose how many posts you want and what each creator is paid. You see the total before you commit." },
          { title: "Approve creators", body: "Creators apply with their profile and audience. You choose who takes part." },
          { title: "See the results", body: "Every published post is linked in your dashboard alongside views and engagement reported by the platform." },
        ],
      },
      {
        type: "features",
        tone: "light",
        eyebrow: "For creators",
        title: "Get paid for the content you already make.",
        items: [
          { icon: "sparkles", title: "Discover new music first", body: "Browse campaigns from African artists before their songs break." },
          { icon: "handshake", title: "Choose what fits", body: "Only apply to campaigns that suit your style and audience. No quotas." },
          { icon: "wallet", title: "Paid locally", body: "Earnings land in your 2kTunes wallet in TZS and withdraw to mobile money or bank." },
          { icon: "shield", title: "Clear rules", body: "Every brief states what's required, and every paid post is disclosed as promotion." },
          { icon: "users", title: "Any audience size", body: "Micro-creators with engaged local followings are often exactly what a campaign needs." },
          { icon: "timer", title: "Paid after review", body: "Once your post is checked against the brief, payment is released to your wallet." },
        ],
      },
      {
        type: "notice",
        tone: "dark",
        title: "Rolling out in stages",
        body: "Creator campaigns are opening country by country, starting in Tanzania. Create a Creator account now and we'll notify you when campaigns are available where you are. We never pay for fake views, bots or undisclosed ads.",
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "Creator FAQ",
        title: "Common questions",
        items: [
          { q: "Who can join as a creator?", a: "Anyone 18 or older with a public TikTok, Instagram or YouTube account in good standing. Campaigns may set their own audience or country requirements." },
          { q: "How much do creators earn?", a: "Each campaign shows its payment per post before you apply. Rates are set by the artist's budget, not by 2kTunes." },
          { q: "Do I have to label posts as ads?", a: "Yes. Paid posts must use the platform's paid-partnership or ad label and follow local advertising rules." },
        ],
        link: { label: "Acceptable Use Policy", to: "/legal/acceptable-use" },
      },
    ],
    cta: { title: "Create your account as a Creator or an Artist.", lede: "Choose your account type when you sign up — you can run campaigns or join them." },
  },
  SW: {
    meta: {
      title: "Watengeneza maudhui",
      description: "Lipwa kutumia muziki mpya wa Afrika kwenye maudhui yako, au endesha kampeni za watengeneza maudhui kwa toleo lako.",
    },
    hero: {
      eyebrow: "Kampeni za watengeneza maudhui",
      title: "Mahali nyimbo mpya zinapokutana na wanaozifanya zivume.",
      lede: "Wasanii wanaandaa kampeni. Watengeneza maudhui wanachagua nyimbo zinazofaa maudhui yao, wanaweka chapisho, na wanalipwa kupitia 2kTunes — kwenda pesa ya simu au benki, kwa shilingi.",
      secondary: { label: "Jinsi utangazaji unavyofanya kazi", to: "/promotion" },
      visual: "campaign",
    },
    sections: [
      {
        type: "steps",
        tone: "raised",
        eyebrow: "Kwa wasanii",
        title: "Endesha kampeni kwa hatua nne.",
        steps: [
          { title: "Andika maelekezo", body: "Chagua wimbo na kipande — kiitikio, mtindo wa kucheza, hisia — na nchi unazotaka kufikia." },
          { title: "Weka bajeti", body: "Chagua idadi ya machapisho na malipo kwa kila mtengeneza maudhui. Unaona jumla kabla ya kukubali." },
          { title: "Idhinisha watengeneza maudhui", body: "Wanaomba wakiwa na wasifu na hadhira yao. Wewe unachagua nani ashiriki." },
          { title: "Ona matokeo", body: "Kila chapisho lililowekwa linaonyeshwa kwenye dashibodi pamoja na watazamaji na mwitikio unaoripotiwa na jukwaa." },
        ],
      },
      {
        type: "features",
        tone: "light",
        eyebrow: "Kwa watengeneza maudhui",
        title: "Lipwa kwa maudhui unayotengeneza tayari.",
        items: [
          { icon: "sparkles", title: "Gundua muziki mpya kwanza", body: "Pitia kampeni za wasanii wa Afrika kabla nyimbo zao hazijavuma." },
          { icon: "handshake", title: "Chagua kinachokufaa", body: "Omba kampeni zinazoendana na mtindo na hadhira yako tu. Hakuna viwango vya lazima." },
          { icon: "wallet", title: "Unalipwa nyumbani", body: "Mapato yanaingia kwenye pochi yako ya 2kTunes kwa TZS na unatoa kwenda pesa ya simu au benki." },
          { icon: "shield", title: "Sheria zilizo wazi", body: "Kila maelekezo yanaeleza kinachohitajika, na kila chapisho la kulipia linaonyeshwa kuwa tangazo." },
          { icon: "users", title: "Hadhira ya ukubwa wowote", body: "Watengeneza maudhui wadogo wenye wafuasi wa karibu mara nyingi ndio hasa kampeni inachohitaji." },
          { icon: "timer", title: "Malipo baada ya ukaguzi", body: "Chapisho lako likikaguliwa dhidi ya maelekezo, malipo yanaingia kwenye pochi yako." },
        ],
      },
      {
        type: "notice",
        tone: "dark",
        title: "Tunaanza hatua kwa hatua",
        body: "Kampeni za watengeneza maudhui zinafunguliwa nchi moja baada ya nyingine, tukianza Tanzania. Fungua akaunti ya Mtengeneza maudhui sasa na tutakujulisha kampeni zikipatikana ulipo. Hatulipii watazamaji wa kughushi, roboti wala matangazo yasiyoonyeshwa.",
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "Maswali ya watengeneza maudhui",
        title: "Maswali ya kawaida",
        items: [
          { q: "Nani anaweza kujiunga kama mtengeneza maudhui?", a: "Yeyote mwenye umri wa miaka 18 au zaidi mwenye akaunti ya wazi ya TikTok, Instagram au YouTube isiyo na matatizo. Kampeni zinaweza kuweka masharti yao ya hadhira au nchi." },
          { q: "Watengeneza maudhui wanapata kiasi gani?", a: "Kila kampeni inaonyesha malipo kwa kila chapisho kabla hujaomba. Viwango vinawekwa na bajeti ya msanii, si 2kTunes." },
          { q: "Lazima nionyeshe kuwa chapisho ni tangazo?", a: "Ndiyo. Machapisho ya kulipia lazima yatumie alama ya ushirikiano wa kulipia au tangazo ya jukwaa na kufuata sheria za matangazo." },
        ],
        link: { label: "Sera ya Matumizi Yanayokubalika", to: "/legal/acceptable-use" },
      },
    ],
    cta: { title: "Fungua akaunti kama Mtengeneza maudhui au Msanii.", lede: "Chagua aina ya akaunti unapojisajili — unaweza kuendesha kampeni au kujiunga nazo." },
  },
};
