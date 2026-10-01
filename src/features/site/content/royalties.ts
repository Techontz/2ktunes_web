import type { Localized } from "@/lib/LanguageContext";
import type { PageCopy } from "../MarketingPage";

export const ROYALTIES: Localized<PageCopy> = {
  EN: {
    meta: {
      title: "Royalties & payouts",
      description: "See every shilling you earn, split royalties with collaborators and withdraw to M-Pesa, Airtel Money, Mixx by Yas or your bank.",
    },
    hero: {
      eyebrow: "Royalties & local payouts",
      title: "Every shilling, accounted for.",
      lede: "Stores report in different currencies on different schedules. 2kTunes brings every report into one wallet, shows it in TZS and pays you out the way you already move money.",
      secondary: { label: "See pricing", to: "/pricing" },
      visual: "wallet",
    },
    sections: [
      {
        type: "features",
        tone: "raised",
        eyebrow: "Withdraw locally",
        title: "Your money, where you actually use it.",
        columns: 4,
        items: [
          { icon: "phone", title: "M-Pesa", body: "Withdraw to your M-Pesa number." },
          { icon: "phone", title: "Airtel Money", body: "Withdraw to your Airtel Money wallet." },
          { icon: "phone", title: "Mixx by Yas", body: "Withdraw to your Mixx by Yas wallet." },
          { icon: "bank", title: "Bank transfer", body: "Withdraw to a local bank account in your name." },
        ],
      },
      {
        type: "notice",
        tone: "dark",
        title: "How withdrawals work",
        body: "Withdrawals are requested from your wallet once your balance passes the minimum shown in your dashboard. Payout methods are enabled country by country as each provider completes onboarding; your dashboard always shows which methods are available to you, any fee, and the exchange rate before you confirm.",
      },
      {
        type: "split",
        tone: "light",
        eyebrow: "Transparent statements",
        title: "Know where every line came from.",
        lede: "Each entry in your wallet traces back to a store, a country, a release and a reporting period. Nothing is lumped together or rounded away.",
        points: [
          "Earnings by store, territory and release",
          "Original currency and TZS side by side",
          "Downloadable statements for your records",
        ],
        visual: "analytics",
      },
      {
        type: "split",
        tone: "dark",
        eyebrow: "Royalty splits",
        title: "Everyone on the song, paid automatically.",
        lede: "Add producers, songwriters and featured artists with their percentage. When a statement arrives, each share goes straight to that person's wallet — no spreadsheets, no chasing.",
        points: ["Splits per release or per track", "Collaborators confirm their share by email", "Each person withdraws their own earnings"],
        visual: "splits",
        reverse: true,
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "Royalty FAQ",
        title: "About getting paid",
        items: [
          { q: "When do royalties appear?", a: "Stores report earnings one to three months after the streams happen. Royalties appear in your wallet once each store's report has been received and processed." },
          { q: "Why do you show TZS?", a: "Because that's the currency you spend. We also show the original currency each store paid in, and the rate used for any conversion." },
          { q: "Is there a minimum withdrawal?", a: "Yes. The current minimum is shown in your wallet before you request a withdrawal." },
          { q: "Do you take a cut of my royalties?", a: "Your plan and any promotion you buy are listed with their prices. Any commission or payout fee is shown in your dashboard before you confirm — never deducted silently." },
        ],
        link: { label: "More in the Help Center", to: "/help" },
      },
    ],
    cta: { title: "Start earning from your catalogue.", lede: "Release with 2kTunes and watch every stream turn into shillings you can use." },
  },
  SW: {
    meta: {
      title: "Mirabaha na malipo",
      description: "Ona kila shilingi unayopata, gawana mirabaha na washirika na toa kwenda M-Pesa, Airtel Money, Mixx by Yas au benki yako.",
    },
    hero: {
      eyebrow: "Mirabaha na malipo ya ndani",
      title: "Kila shilingi, inahesabiwa.",
      lede: "Maduka huripoti kwa sarafu tofauti na kwa ratiba tofauti. 2kTunes inaleta kila ripoti kwenye pochi moja, inaonyesha kwa TZS na inakulipa kwa njia unayotumia kutuma pesa tayari.",
      secondary: { label: "Angalia bei", to: "/pricing" },
      visual: "wallet",
    },
    sections: [
      {
        type: "features",
        tone: "raised",
        eyebrow: "Toa pesa nyumbani",
        title: "Pesa yako, pale unapoitumia.",
        columns: 4,
        items: [
          { icon: "phone", title: "M-Pesa", body: "Toa kwenda namba yako ya M-Pesa." },
          { icon: "phone", title: "Airtel Money", body: "Toa kwenda pochi yako ya Airtel Money." },
          { icon: "phone", title: "Mixx by Yas", body: "Toa kwenda pochi yako ya Mixx by Yas." },
          { icon: "bank", title: "Benki", body: "Toa kwenda akaunti ya benki ya ndani kwa jina lako." },
        ],
      },
      {
        type: "notice",
        tone: "dark",
        title: "Jinsi utoaji wa pesa unavyofanya kazi",
        body: "Unaomba kutoa pesa kutoka pochi yako salio likipita kiwango cha chini kinachoonyeshwa kwenye dashibodi. Njia za malipo zinawashwa nchi kwa nchi kadiri kila mtoa huduma anavyokamilisha usajili; dashibodi yako inaonyesha daima njia zinazopatikana kwako, ada yoyote na kiwango cha ubadilishaji kabla hujathibitisha.",
      },
      {
        type: "split",
        tone: "light",
        eyebrow: "Ripoti zilizo wazi",
        title: "Jua kila mstari umetoka wapi.",
        lede: "Kila ingizo kwenye pochi yako linaonyesha duka, nchi, toleo na kipindi cha ripoti. Hakuna kinachochanganywa wala kupotea kwa kukadiria.",
        points: ["Mapato kwa duka, nchi na toleo", "Sarafu ya asili na TZS pamoja", "Ripoti za kupakua kwa kumbukumbu zako"],
        visual: "analytics",
      },
      {
        type: "split",
        tone: "dark",
        eyebrow: "Mgawanyo wa mirabaha",
        title: "Kila aliye kwenye wimbo, analipwa moja kwa moja.",
        lede: "Ongeza watayarishaji, watunzi na wasanii walioshirikishwa pamoja na asilimia zao. Ripoti ikifika, kila sehemu inakwenda moja kwa moja kwenye pochi ya mhusika — bila majedwali, bila kufuatilia.",
        points: ["Mgawanyo kwa toleo au kwa wimbo", "Washirika wanathibitisha sehemu yao kwa barua pepe", "Kila mtu anatoa mapato yake mwenyewe"],
        visual: "splits",
        reverse: true,
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "Maswali ya mirabaha",
        title: "Kuhusu kulipwa",
        items: [
          { q: "Mirabaha inaonekana lini?", a: "Maduka huripoti mapato mwezi mmoja hadi mitatu baada ya usikilizaji. Mirabaha inaonekana kwenye pochi yako ripoti ya kila duka ikipokelewa na kushughulikiwa." },
          { q: "Kwa nini mnaonyesha TZS?", a: "Kwa sababu hiyo ndiyo sarafu unayotumia. Pia tunaonyesha sarafu ya asili ambayo kila duka lililipa, na kiwango kilichotumika kubadilisha." },
          { q: "Kuna kiwango cha chini cha kutoa?", a: "Ndiyo. Kiwango cha sasa kinaonyeshwa kwenye pochi yako kabla ya kuomba kutoa pesa." },
          { q: "Mnachukua sehemu ya mirabaha yangu?", a: "Kifurushi chako na utangazaji wowote unaonunua vimeorodheshwa pamoja na bei zake. Kamisheni au ada yoyote ya malipo inaonyeshwa kwenye dashibodi kabla hujathibitisha — haikatwi kimyakimya." },
        ],
        link: { label: "Zaidi kwenye Kituo cha Msaada", to: "/help" },
      },
    ],
    cta: { title: "Anza kupata mapato kutoka kazi zako.", lede: "Toa muziki na 2kTunes na uone kila usikilizaji ukigeuka shilingi unazoweza kutumia." },
  },
};
