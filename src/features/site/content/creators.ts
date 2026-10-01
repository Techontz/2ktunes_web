import type { Localized } from "@/lib/LanguageContext";
import type { PageCopy } from "../MarketingPage";

export const CREATORS: Localized<PageCopy> = {
  EN: {
    meta: {
      title: "Creators",
      description: "List your own promotion packages and get paid to feature new African music, or order a creator package for your release.",
    },
    hero: {
      eyebrow: "Creator campaigns",
      title: "Where new songs meet the people who make them trend.",
      lede: "Creators list their own packages and prices. Artists browse creators and order a package; the creator posts, and gets paid into their 2kTunes wallet — then withdraws to mobile money or bank.",
      secondary: { label: "How promotion works", to: "/promotion" },
      visual: "campaign",
    },
    sections: [
      {
        type: "steps",
        tone: "raised",
        eyebrow: "For artists",
        title: "Order a creator package in four steps.",
        steps: [
          { title: "Browse creators", body: "Compare creators by platform, audience and the packages they offer. Audience figures are marked self-reported until 2kTunes verifies them." },
          { title: "Order a package", body: "Pick a package at the creator's price and pay from your wallet. 2kTunes holds the money while the creator accepts or declines your order." },
          { title: "Approve the post", body: "The creator submits the post link. Approve it or ask for a revision — if you don't respond within the review window, it's approved automatically." },
          { title: "See the results", body: "Every delivered post is linked in your order, so you can follow how it performs." },
        ],
      },
      {
        type: "features",
        tone: "light",
        eyebrow: "For creators",
        title: "Get paid for the content you already make.",
        items: [
          { icon: "sparkles", title: "Your packages, your prices", body: "Build a profile with your TikTok, Instagram or YouTube accounts and list the packages you offer, at prices you set." },
          { icon: "handshake", title: "Choose what fits", body: "Accept the orders that suit your style and audience, and decline the rest. No quotas." },
          { icon: "wallet", title: "Paid locally", body: "Earnings land in your 2kTunes wallet in the package's currency, minus a 15% platform fee, and withdraw to mobile money or bank." },
          { icon: "shield", title: "Clear rules", body: "Every package states what's included, every paid post is disclosed as promotion, and 2kTunes staff resolve any dispute." },
          { icon: "users", title: "Any audience size", body: "Micro-creators with engaged local followings are often exactly what an artist needs." },
          { icon: "timer", title: "Paid after approval", body: "Once the artist approves your post — or the review window passes without a response — payment is released to your wallet." },
        ],
      },
      {
        type: "notice",
        tone: "dark",
        title: "Reviewed before you go live",
        body: "2kTunes reviews every creator profile before artists can see it, and audience figures stay marked self-reported until we verify them. Every paid post must be disclosed as promotion. We never pay for fake views, bots or undisclosed ads.",
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "Creator FAQ",
        title: "Common questions",
        items: [
          { q: "Who can join as a creator?", a: "Anyone 18 or older with a public TikTok, Instagram or YouTube account in good standing. Your profile is reviewed by 2kTunes before it appears to artists." },
          { q: "How much do creators earn?", a: "You set the price of each package you list. When an order is approved, you're paid that price minus a 15% platform fee." },
          { q: "What if the artist and I disagree?", a: "Disputes about an order are resolved by 2kTunes staff, who review it and decide the outcome." },
          { q: "Do I have to label posts as ads?", a: "Yes. Paid posts must use the platform's paid-partnership or ad label and follow local advertising rules." },
        ],
        link: { label: "Acceptable Use Policy", to: "/legal/acceptable-use" },
      },
    ],
    cta: { title: "Create your account as a Creator or an Artist.", lede: "Choose your account type when you sign up — you can order creator packages or offer your own." },
  },
  SW: {
    meta: {
      title: "Watengeneza maudhui",
      description: "Orodhesha vifurushi vyako vya utangazaji na ulipwe kutumia muziki mpya wa Afrika, au agiza kifurushi cha mtengeneza maudhui kwa toleo lako.",
    },
    hero: {
      eyebrow: "Kampeni za watengeneza maudhui",
      title: "Mahali nyimbo mpya zinapokutana na wanaozifanya zivume.",
      lede: "Watengeneza maudhui wanaorodhesha vifurushi na bei zao wenyewe. Wasanii wanawapitia na kuagiza kifurushi; mtengeneza maudhui anaweka chapisho, na analipwa kwenye pochi yake ya 2kTunes — kisha anatoa kwenda pesa ya simu au benki.",
      secondary: { label: "Jinsi utangazaji unavyofanya kazi", to: "/promotion" },
      visual: "campaign",
    },
    sections: [
      {
        type: "steps",
        tone: "raised",
        eyebrow: "Kwa wasanii",
        title: "Agiza kifurushi cha mtengeneza maudhui kwa hatua nne.",
        steps: [
          { title: "Pitia watengeneza maudhui", body: "Linganisha watengeneza maudhui kwa jukwaa, hadhira na vifurushi wanavyotoa. Takwimu za hadhira zinaonyeshwa kuwa zimetolewa na wao wenyewe hadi 2kTunes izithibitishe." },
          { title: "Agiza kifurushi", body: "Chagua kifurushi kwa bei ya mtengeneza maudhui na ulipe kutoka pochi yako. 2kTunes inashikilia pesa wakati mtengeneza maudhui anakubali au kukataa agizo lako." },
          { title: "Idhinisha chapisho", body: "Mtengeneza maudhui anawasilisha kiungo cha chapisho. Idhinisha au omba marekebisho — usipojibu ndani ya muda wa ukaguzi, linaidhinishwa lenyewe." },
          { title: "Ona matokeo", body: "Kila chapisho lililowasilishwa linaonyeshwa kwenye agizo lako, ili ufuatilie linavyofanya." },
        ],
      },
      {
        type: "features",
        tone: "light",
        eyebrow: "Kwa watengeneza maudhui",
        title: "Lipwa kwa maudhui unayotengeneza tayari.",
        items: [
          { icon: "sparkles", title: "Vifurushi vyako, bei zako", body: "Tengeneza wasifu wenye akaunti zako za TikTok, Instagram au YouTube na uorodheshe vifurushi unavyotoa, kwa bei unazoweka." },
          { icon: "handshake", title: "Chagua kinachokufaa", body: "Kubali maagizo yanayoendana na mtindo na hadhira yako, na ukatae mengine. Hakuna viwango vya lazima." },
          { icon: "wallet", title: "Unalipwa nyumbani", body: "Mapato yanaingia kwenye pochi yako ya 2kTunes kwa sarafu ya kifurushi, baada ya kukatwa ada ya jukwaa ya 15%, na unatoa kwenda pesa ya simu au benki." },
          { icon: "shield", title: "Sheria zilizo wazi", body: "Kila kifurushi kinaeleza kilichomo, kila chapisho la kulipia linaonyeshwa kuwa tangazo, na wafanyakazi wa 2kTunes wanatatua mgogoro wowote." },
          { icon: "users", title: "Hadhira ya ukubwa wowote", body: "Watengeneza maudhui wadogo wenye wafuasi wa karibu mara nyingi ndio hasa msanii anachohitaji." },
          { icon: "timer", title: "Malipo baada ya kuidhinishwa", body: "Msanii akiidhinisha chapisho lako — au muda wa ukaguzi ukipita bila jibu — malipo yanaingia kwenye pochi yako." },
        ],
      },
      {
        type: "notice",
        tone: "dark",
        title: "Unakaguliwa kabla ya kuonekana",
        body: "2kTunes inakagua kila wasifu wa mtengeneza maudhui kabla wasanii hawajauona, na takwimu za hadhira zinaonyeshwa kuwa zimetolewa na wewe mwenyewe hadi tuzithibitishe. Kila chapisho la kulipia lazima lionyeshwe kuwa tangazo. Hatulipii watazamaji wa kughushi, roboti wala matangazo yasiyoonyeshwa.",
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "Maswali ya watengeneza maudhui",
        title: "Maswali ya kawaida",
        items: [
          { q: "Nani anaweza kujiunga kama mtengeneza maudhui?", a: "Yeyote mwenye umri wa miaka 18 au zaidi mwenye akaunti ya wazi ya TikTok, Instagram au YouTube isiyo na matatizo. Wasifu wako unakaguliwa na 2kTunes kabla ya kuonekana kwa wasanii." },
          { q: "Watengeneza maudhui wanapata kiasi gani?", a: "Wewe unaweka bei ya kila kifurushi unachoorodhesha. Agizo likiidhinishwa, unalipwa bei hiyo baada ya kukatwa ada ya jukwaa ya 15%." },
          { q: "Itakuwaje msanii na mimi tusipokubaliana?", a: "Migogoro kuhusu agizo inatatuliwa na wafanyakazi wa 2kTunes, ambao wanaikagua na kuamua matokeo." },
          { q: "Lazima nionyeshe kuwa chapisho ni tangazo?", a: "Ndiyo. Machapisho ya kulipia lazima yatumie alama ya ushirikiano wa kulipia au tangazo ya jukwaa na kufuata sheria za matangazo." },
        ],
        link: { label: "Sera ya Matumizi Yanayokubalika", to: "/legal/acceptable-use" },
      },
    ],
    cta: { title: "Fungua akaunti kama Mtengeneza maudhui au Msanii.", lede: "Chagua aina ya akaunti unapojisajili — unaweza kuagiza vifurushi vya watengeneza maudhui au kutoa vyako." },
  },
};
