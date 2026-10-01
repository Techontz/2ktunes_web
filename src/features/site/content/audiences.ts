import type { Localized } from "@/lib/LanguageContext";
import type { PageCopy } from "../MarketingPage";

export const ARTISTS: Localized<PageCopy> = {
  EN: {
    meta: { title: "For artists", description: "Release, promote and get paid as an independent artist — with support that understands East African music." },
    hero: {
      eyebrow: "For independent artists",
      title: "Run your career like the professional you are.",
      lede: "Release on your schedule, keep your rights, see what's working and get paid at home. 2kTunes is the team behind your release, without taking your masters.",
      secondary: { label: "See pricing", to: "/pricing" },
      visual: "release",
    },
    sections: [
      {
        type: "features",
        tone: "raised",
        eyebrow: "Built for artists",
        title: "What you get from day one.",
        items: [
          { icon: "globe", title: "Global & African stores", body: "Your music on the platforms fans use, from Spotify to Boomplay." },
          { icon: "shield", title: "Your rights, always", body: "No exclusivity, no hidden ownership clauses. Leave whenever you want." },
          { icon: "megaphone", title: "Promotion that's honest", body: "Pitching, curators, creator campaigns and ads — clearly explained." },
          { icon: "wallet", title: "Get paid in TZS", body: "Withdraw to M-Pesa, Airtel Money, Mixx by Yas or your bank." },
          { icon: "pie", title: "Split with your team", body: "Producers and writers get their share automatically." },
          { icon: "chart", title: "Know your audience", body: "See which songs, countries and platforms are moving." },
        ],
      },
      {
        type: "split",
        tone: "light",
        eyebrow: "Your first release",
        title: "No industry jargon required.",
        lede: "The upload flow explains every field in plain English or Kiswahili, and our review catches what stores would reject before it costs you time.",
        points: ["Save drafts and finish later", "Clear reasons if something needs fixing", "Status for every store after delivery"],
        visual: "release",
      },
      {
        type: "split",
        tone: "dark",
        eyebrow: "Getting paid",
        title: "From streams to your phone.",
        lede: "Royalties from every store collect in one wallet, shown in shillings. Withdraw to mobile money or your bank once you pass the minimum.",
        visual: "wallet",
        reverse: true,
        link: { label: "How royalties work", to: "/royalties" },
      },
    ],
    cta: { title: "Your music. Your rights. Your money.", lede: "Create your artist account in a minute." },
  },
  SW: {
    meta: { title: "Kwa wasanii", description: "Toa muziki, jitangaze na lipwa kama msanii huru — kwa msaada unaoelewa muziki wa Afrika Mashariki." },
    hero: {
      eyebrow: "Kwa wasanii huru",
      title: "Endesha kazi yako kama mtaalamu ulivyo.",
      lede: "Toa muziki kwa ratiba yako, baki na haki zako, ona kinachofanya kazi na ulipwe nyumbani. 2kTunes ni timu nyuma ya toleo lako, bila kuchukua master zako.",
      secondary: { label: "Angalia bei", to: "/pricing" },
      visual: "release",
    },
    sections: [
      {
        type: "features",
        tone: "raised",
        eyebrow: "Imejengwa kwa wasanii",
        title: "Unachopata tangu siku ya kwanza.",
        items: [
          { icon: "globe", title: "Maduka ya kimataifa na Afrika", body: "Muziki wako kwenye majukwaa ambayo mashabiki wanatumia, kutoka Spotify hadi Boomplay." },
          { icon: "shield", title: "Haki zako, daima", body: "Hakuna upekee wa lazima, hakuna vipengele vya umiliki vilivyofichwa. Ondoka wakati wowote." },
          { icon: "megaphone", title: "Utangazaji wa uaminifu", body: "Kuwasilisha kwa wahariri, wachaguzi, kampeni na matangazo — vimeelezwa wazi." },
          { icon: "wallet", title: "Lipwa kwa TZS", body: "Toa kwenda M-Pesa, Airtel Money, Mixx by Yas au benki yako." },
          { icon: "pie", title: "Gawana na timu yako", body: "Watayarishaji na watunzi wanapata sehemu yao moja kwa moja." },
          { icon: "chart", title: "Ijue hadhira yako", body: "Ona nyimbo, nchi na majukwaa yanayofanya vizuri." },
        ],
      },
      {
        type: "split",
        tone: "light",
        eyebrow: "Toleo lako la kwanza",
        title: "Huhitaji lugha ngumu ya tasnia.",
        lede: "Hatua za kupakia zinaeleza kila sehemu kwa Kiingereza au Kiswahili rahisi, na ukaguzi wetu unagundua kile maduka yangekataa kabla hakijakupotezea muda.",
        points: ["Hifadhi rasimu na umalize baadaye", "Sababu wazi kama kitu kinahitaji kurekebishwa", "Hali ya kila duka baada ya kusambazwa"],
        visual: "release",
      },
      {
        type: "split",
        tone: "dark",
        eyebrow: "Kulipwa",
        title: "Kutoka usikilizaji hadi simu yako.",
        lede: "Mirabaha kutoka kila duka inakusanyika kwenye pochi moja, ikionyeshwa kwa shilingi. Toa kwenda pesa ya simu au benki ukipita kiwango cha chini.",
        visual: "wallet",
        reverse: true,
        link: { label: "Jinsi mirabaha inavyofanya kazi", to: "/royalties" },
      },
    ],
    cta: { title: "Muziki wako. Haki zako. Pesa yako.", lede: "Fungua akaunti ya msanii kwa dakika moja." },
  },
};

export const LABELS: Localized<PageCopy> = {
  EN: {
    meta: { title: "For labels", description: "Manage a roster, catalogue and royalty splits across artists — with local payouts for everyone." },
    hero: {
      eyebrow: "For labels & teams",
      title: "One dashboard for your whole roster.",
      lede: "Manage artists, releases, splits and payouts in one place. Give each artist visibility, keep your catalogue organised and pay everyone locally.",
      secondary: { label: "Contact us", to: "/contact" },
      visual: "analytics",
    },
    sections: [
      {
        type: "features",
        tone: "raised",
        eyebrow: "Roster tools",
        title: "Built for managers, labels and collectives.",
        items: [
          { icon: "users", title: "Multiple artist profiles", body: "Release under as many artist names as your plan allows, from one account." },
          { icon: "layers", title: "Catalogue in one view", body: "Every release, status and delivery across your roster." },
          { icon: "pie", title: "Splits across the roster", body: "Set label, artist and producer shares per release." },
          { icon: "dollar", title: "Consolidated reporting", body: "Earnings by artist, release, store and territory." },
          { icon: "megaphone", title: "Campaigns per artist", body: "Plan pitching and creator campaigns release by release." },
          { icon: "handshake", title: "A real contact", body: "Label accounts can ask for a dedicated contact on our team." },
        ],
      },
      {
        type: "split",
        tone: "light",
        eyebrow: "Money that moves",
        title: "Pay your artists without the admin.",
        lede: "Splits route each artist's share to their own wallet, and they withdraw to mobile money or bank themselves. Your team stops calculating payouts by hand.",
        points: ["Automatic per-release splits", "Each artist sees their own statements", "Local withdrawals for everyone"],
        visual: "splits",
      },
      {
        type: "notice",
        tone: "dark",
        title: "Moving an existing catalogue?",
        body: "We can help migrate releases from another distributor using your existing ISRCs and original release dates, so play counts and history carry over. Contact us before you start so we can plan the switch without downtime.",
      },
    ],
    cta: { title: "Bring your roster to 2kTunes.", lede: "Create a Label / Team account, or talk to us about a larger catalogue.", secondary: { label: "Contact us", to: "/contact" } },
  },
  SW: {
    meta: { title: "Kwa lebo", description: "Simamia wasanii, kazi zao na mgawanyo wa mirabaha — pamoja na malipo ya ndani kwa kila mmoja." },
    hero: {
      eyebrow: "Kwa lebo na timu",
      title: "Dashibodi moja kwa wasanii wako wote.",
      lede: "Simamia wasanii, matoleo, mgawanyo na malipo mahali pamoja. Mpe kila msanii uwazi, panga kazi zako na mlipe kila mtu nyumbani.",
      secondary: { label: "Wasiliana nasi", to: "/contact" },
      visual: "analytics",
    },
    sections: [
      {
        type: "features",
        tone: "raised",
        eyebrow: "Zana za lebo",
        title: "Imejengwa kwa mameneja, lebo na makundi.",
        items: [
          { icon: "users", title: "Wasifu wa wasanii wengi", body: "Toa muziki kwa majina mengi ya wasanii kadiri kifurushi chako kinavyoruhusu, kutoka akaunti moja." },
          { icon: "layers", title: "Kazi zote mahali pamoja", body: "Kila toleo, hali yake na usambazaji kwa wasanii wako wote." },
          { icon: "pie", title: "Mgawanyo kwa wasanii wote", body: "Weka sehemu za lebo, msanii na mtayarishaji kwa kila toleo." },
          { icon: "dollar", title: "Ripoti za pamoja", body: "Mapato kwa msanii, toleo, duka na nchi." },
          { icon: "megaphone", title: "Kampeni kwa kila msanii", body: "Panga kuwasilisha kwa wahariri na kampeni kwa kila toleo." },
          { icon: "handshake", title: "Mtu halisi wa kuwasiliana", body: "Akaunti za lebo zinaweza kuomba mtu maalum wa kuwasiliana kwenye timu yetu." },
        ],
      },
      {
        type: "split",
        tone: "light",
        eyebrow: "Pesa inayotembea",
        title: "Walipe wasanii wako bila usumbufu.",
        lede: "Mgawanyo unapeleka sehemu ya kila msanii kwenye pochi yake, na anatoa kwenda pesa ya simu au benki mwenyewe. Timu yako inaacha kukokotoa malipo kwa mkono.",
        points: ["Mgawanyo wa moja kwa moja kwa kila toleo", "Kila msanii anaona ripoti zake", "Utoaji wa ndani kwa kila mtu"],
        visual: "splits",
      },
      {
        type: "notice",
        tone: "dark",
        title: "Unahamisha kazi zilizopo?",
        body: "Tunaweza kusaidia kuhamisha matoleo kutoka msambazaji mwingine kwa kutumia ISRC zako na tarehe za awali za kutoa, ili idadi ya usikilizaji na historia viendelee. Wasiliana nasi kabla ya kuanza ili tupange uhamisho bila kukatika.",
      },
    ],
    cta: { title: "Leta wasanii wako 2kTunes.", lede: "Fungua akaunti ya Lebo / Timu, au zungumza nasi kuhusu kazi nyingi zaidi.", secondary: { label: "Wasiliana nasi", to: "/contact" } },
  },
};

export const ABOUT: Localized<PageCopy> = {
  EN: {
    meta: { title: "About", description: "2kTunes is an African-first music distribution company built in Tanzania." },
    hero: {
      eyebrow: "About 2kTunes",
      title: "Built in Tanzania, for artists who want the world.",
      lede: "We started 2kTunes because East African artists deserve the same global reach as anyone else — without losing their rights or waiting months for money they can't easily withdraw.",
      secondary: { label: "Contact us", to: "/contact" },
    },
    sections: [
      {
        type: "prose",
        tone: "raised",
        eyebrow: "Why we exist",
        title: "Global distribution was never built with us in mind.",
        paragraphs: [
          "For years, artists here have had two options: sign away rights to someone with access, or use a distributor built for another market — English-only dashboards, dollar balances, bank-only payouts and support in a different time zone.",
          "2kTunes is the third option. We deliver to the same global stores, add the African platforms your fans actually use, and pay out through the mobile money and bank accounts you already have, in the currency you spend.",
          "We're also honest about the hard part. No one can guarantee streams or playlist spots, and anyone who promises them is selling something risky. What we can do is give you clean delivery, transparent money and real routes to an audience.",
        ],
        aside: [
          { label: "Headquarters", value: "Dar es Salaam, Tanzania" },
          { label: "Languages", value: "English · Kiswahili" },
          { label: "Home currency", value: "Tanzanian shilling (TZS)" },
        ],
      },
      {
        type: "features",
        tone: "light",
        eyebrow: "What we believe",
        title: "Principles we build by.",
        items: [
          { icon: "shield", title: "Artists own their work", body: "We're a service you hire, not a label you sign to." },
          { icon: "dollar", title: "Money should be legible", body: "Every shilling traced to its source; every fee shown before you pay." },
          { icon: "badge", title: "No fake promises", body: "We never sell guaranteed streams, placements or features." },
        ],
      },
    ],
    cta: { title: "Come build with us.", lede: "Release your music, or get in touch about partnerships.", secondary: { label: "Contact us", to: "/contact" } },
  },
  SW: {
    meta: { title: "Kuhusu", description: "2kTunes ni kampuni ya usambazaji wa muziki inayoweka Afrika kwanza, iliyojengwa Tanzania." },
    hero: {
      eyebrow: "Kuhusu 2kTunes",
      title: "Imejengwa Tanzania, kwa wasanii wanaotaka dunia.",
      lede: "Tulianzisha 2kTunes kwa sababu wasanii wa Afrika Mashariki wanastahili kufika duniani kama mtu mwingine yeyote — bila kupoteza haki zao wala kusubiri miezi kwa pesa wasiyoweza kutoa kwa urahisi.",
      secondary: { label: "Wasiliana nasi", to: "/contact" },
    },
    sections: [
      {
        type: "prose",
        tone: "raised",
        eyebrow: "Kwa nini tupo",
        title: "Usambazaji wa kimataifa haukujengwa ukitufikiria sisi.",
        paragraphs: [
          "Kwa miaka mingi, wasanii wa hapa wamekuwa na njia mbili: kuachia haki zao kwa mtu mwenye uwezo wa kufika, au kutumia msambazaji aliyejengwa kwa soko jingine — dashibodi za Kiingereza tu, salio kwa dola, malipo ya benki tu na msaada kutoka saa za eneo jingine.",
          "2kTunes ni njia ya tatu. Tunasambaza kwenye maduka yaleyale ya kimataifa, tunaongeza majukwaa ya Afrika ambayo mashabiki wako wanatumia, na tunalipa kupitia pesa ya simu na akaunti za benki ulizonazo tayari, kwa sarafu unayotumia.",
          "Pia tuko wazi kuhusu sehemu ngumu. Hakuna anayeweza kuhakikisha usikilizaji au nafasi kwenye orodha, na anayeahidi hivyo anauza kitu cha hatari. Tunachoweza ni kukupa usambazaji safi, pesa zilizo wazi na njia halisi za kufikia hadhira.",
        ],
        aside: [
          { label: "Makao makuu", value: "Dar es Salaam, Tanzania" },
          { label: "Lugha", value: "Kiingereza · Kiswahili" },
          { label: "Sarafu ya nyumbani", value: "Shilingi ya Tanzania (TZS)" },
        ],
      },
      {
        type: "features",
        tone: "light",
        eyebrow: "Tunachoamini",
        title: "Misingi tunayojenga nayo.",
        items: [
          { icon: "shield", title: "Wasanii wanamiliki kazi zao", body: "Sisi ni huduma unayoiajiri, si lebo unayojifunga nayo." },
          { icon: "dollar", title: "Pesa ieleweke", body: "Kila shilingi inaonyesha ilikotoka; kila ada inaonyeshwa kabla ya kulipa." },
          { icon: "badge", title: "Hakuna ahadi za uongo", body: "Hatuuzi usikilizaji, nafasi wala kuchaguliwa kulikohakikishwa." },
        ],
      },
    ],
    cta: { title: "Njoo tujenge pamoja.", lede: "Toa muziki wako, au wasiliana nasi kuhusu ushirikiano.", secondary: { label: "Wasiliana nasi", to: "/contact" } },
  },
};
