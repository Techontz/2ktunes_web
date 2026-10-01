import type { Localized } from "@/lib/LanguageContext";
import type { PageCopy } from "../MarketingPage";

export const PROMOTION: Localized<PageCopy> = {
  EN: {
    meta: {
      title: "Promotion",
      description: "Editorial pitching, independent curators, creator campaigns and advertising — clearly explained, never guaranteed.",
    },
    hero: {
      eyebrow: "Promotion",
      title: "Reach listeners, honestly.",
      lede: "Getting on a store is the start. 2kTunes gives you four distinct ways to find an audience — and tells you plainly who decides, what you pay for and what no one can promise.",
      secondary: { label: "Creator campaigns", to: "/creators" },
      visual: "campaign",
    },
    sections: [
      {
        type: "compare",
        tone: "raised",
        eyebrow: "Four routes",
        title: "Know exactly what you're getting.",
        lede: "Promotion is often sold as one vague package. We keep the four routes separate so you can choose with clear expectations.",
        caption: "Comparison of promotion options",
        headers: ["Route", "What it is", "Who decides", "Guaranteed result?"],
        rows: [
          {
            name: "Editorial pitching",
            what: "A pitch for store editors to consider an upcoming release.",
            who: "Store editorial teams",
            guaranteed: "No",
          },
          {
            name: "Independent curators",
            what: "Your track is offered to independent playlist curators and blogs for review.",
            who: "Each curator",
            guaranteed: "No — you pay for review",
          },
          {
            name: "Creator campaigns",
            what: "Creators are paid to publish content that uses your song, disclosed as promotion.",
            who: "You approve the brief; creators opt in",
            guaranteed: "Posts published, not views",
          },
          {
            name: "Advertising",
            what: "Paid ads on platforms you choose, with your budget and target audience.",
            who: "You, within platform ad rules",
            guaranteed: "Ad delivery, not streams",
          },
        ],
        note: "We never buy streams, followers or playlist spots, and we remove any curator or creator who does. Artificial streaming can get your release removed from stores.",
      },
      {
        type: "features",
        tone: "dark",
        eyebrow: "In detail",
        title: "How each route works.",
        columns: 2,
        items: [
          {
            icon: "list",
            tag: "Included",
            title: "Editorial pitching",
            body: "For eligible stores, submit one upcoming song with genre, mood, language and story. We format the pitch the way editors ask for it. Editors are independent and most pitches are not selected — that's normal.",
          },
          {
            icon: "headphones",
            tag: "Paid review",
            title: "Independent curator services",
            body: "Choose curators by genre and region. Each one listens and decides whether to add or write about your track, and leaves feedback either way. Your fee covers their time, not a placement.",
          },
          {
            icon: "video",
            tag: "Paid campaign",
            title: "Creator campaigns",
            body: "Set a brief and budget; vetted creators in Tanzania, Kenya and beyond apply to join. Posts are checked before payout and must be labelled as paid promotion in line with platform rules.",
          },
          {
            icon: "megaphone",
            tag: "Paid media",
            title: "Advertising",
            body: "Promote a release with ads that lead to a smart link or store page. You control the budget, dates and audience; reporting shows spend and ad results.",
          },
        ],
      },
      {
        type: "split",
        tone: "light",
        eyebrow: "Release planning",
        title: "Promotion works best when it's planned.",
        lede: "Your dashboard lines up the release date, pitch deadline and campaign start so each step supports the next.",
        points: ["Pitch deadline reminders", "Pre-release campaign scheduling", "Results per route after release"],
        visual: "analytics",
      },
      {
        type: "faq",
        tone: "dark",
        eyebrow: "Promotion FAQ",
        title: "Straight answers",
        items: [
          { q: "Will pitching get me on a playlist?", a: "Not necessarily. Editors receive far more pitches than they can feature. A good pitch improves your chances; it doesn't decide the outcome." },
          { q: "Do creators have to say they were paid?", a: "Yes. Every campaign post must be disclosed as paid promotion according to the platform's rules and local advertising law." },
          { q: "What happens if a creator doesn't post?", a: "You pay only for posts that are published and meet the brief. Posts that don't are not paid for." },
        ],
        link: { label: "Read the Acceptable Use Policy", to: "/legal/acceptable-use" },
      },
    ],
    cta: { title: "Release first. Then let's find your listeners.", secondary: { label: "For creators", to: "/creators" } },
  },
  SW: {
    meta: {
      title: "Utangazaji",
      description: "Kuwasilisha kwa wahariri, wachaguzi huru, kampeni za watengeneza maudhui na matangazo — yameelezwa wazi, bila ahadi za uongo.",
    },
    hero: {
      eyebrow: "Utangazaji",
      title: "Fikia wasikilizaji, kwa uaminifu.",
      lede: "Kuingia dukani ni mwanzo tu. 2kTunes inakupa njia nne tofauti za kupata hadhira — na inakueleza wazi nani anaamua, unalipia nini na nini hakuna anayeweza kuahidi.",
      secondary: { label: "Kampeni za watengeneza maudhui", to: "/creators" },
      visual: "campaign",
    },
    sections: [
      {
        type: "compare",
        tone: "raised",
        eyebrow: "Njia nne",
        title: "Jua hasa unachopata.",
        lede: "Utangazaji mara nyingi huuzwa kama kifurushi kisicho wazi. Sisi tunatenganisha njia nne ili uchague ukiwa na matarajio sahihi.",
        caption: "Ulinganisho wa njia za utangazaji",
        headers: ["Njia", "Ni nini", "Nani anaamua", "Matokeo yamehakikishwa?"],
        rows: [
          { name: "Kuwasilisha kwa wahariri", what: "Ombi kwa wahariri wa maduka kuzingatia toleo linalokuja.", who: "Timu za wahariri wa maduka", guaranteed: "Hapana" },
          { name: "Wachaguzi huru", what: "Wimbo wako unapelekwa kwa wachaguzi huru wa orodha na blogu kwa ukaguzi.", who: "Kila mchaguzi", guaranteed: "Hapana — unalipia ukaguzi" },
          { name: "Kampeni za watengeneza maudhui", what: "Watengeneza maudhui wanalipwa kuweka maudhui yanayotumia wimbo wako, yakionyeshwa wazi kuwa tangazo.", who: "Wewe unaidhinisha maelekezo; wao wanajiunga", guaranteed: "Machapisho, si idadi ya watazamaji" },
          { name: "Matangazo", what: "Matangazo ya kulipia kwenye majukwaa unayochagua, kwa bajeti na hadhira yako.", who: "Wewe, ndani ya sheria za jukwaa", guaranteed: "Matangazo kuonyeshwa, si usikilizaji" },
        ],
        note: "Hatununui usikilizaji, wafuasi wala nafasi kwenye orodha, na tunamwondoa mchaguzi au mtengeneza maudhui yeyote anayefanya hivyo. Usikilizaji wa kughushi unaweza kusababisha toleo lako kuondolewa madukani.",
      },
      {
        type: "features",
        tone: "dark",
        eyebrow: "Kwa undani",
        title: "Jinsi kila njia inavyofanya kazi.",
        columns: 2,
        items: [
          { icon: "list", tag: "Imejumuishwa", title: "Kuwasilisha kwa wahariri", body: "Kwa maduka yanayoruhusu, wasilisha wimbo mmoja unaokuja pamoja na aina, hisia, lugha na hadithi yake. Tunaandaa ombi jinsi wahariri wanavyotaka. Wahariri ni huru na maombi mengi hayachaguliwi — hilo ni kawaida." },
          { icon: "headphones", tag: "Ukaguzi wa kulipia", title: "Huduma za wachaguzi huru", body: "Chagua wachaguzi kwa aina ya muziki na eneo. Kila mmoja anasikiliza na kuamua kama ataongeza au kuandika kuhusu wimbo wako, na anatoa maoni kwa vyovyote. Ada yako ni ya muda wao, si nafasi." },
          { icon: "video", tag: "Kampeni ya kulipia", title: "Kampeni za watengeneza maudhui", body: "Weka maelekezo na bajeti; watengeneza maudhui waliohakikiwa wa Tanzania, Kenya na kwingineko wanaomba kujiunga. Machapisho yanakaguliwa kabla ya malipo na lazima yaonyeshwe kuwa ni tangazo la kulipia." },
          { icon: "megaphone", tag: "Matangazo ya kulipia", title: "Matangazo", body: "Tangaza toleo kwa matangazo yanayoelekeza kwenye kiungo au ukurasa wa duka. Unadhibiti bajeti, tarehe na hadhira; ripoti zinaonyesha matumizi na matokeo." },
        ],
      },
      {
        type: "split",
        tone: "light",
        eyebrow: "Kupanga toleo",
        title: "Utangazaji hufanya kazi vizuri ukipangwa.",
        lede: "Dashibodi yako inapanga tarehe ya kutoa, mwisho wa kuwasilisha kwa wahariri na mwanzo wa kampeni ili kila hatua isaidie inayofuata.",
        points: ["Vikumbusho vya mwisho wa kuwasilisha", "Kupanga kampeni kabla ya kutoa", "Matokeo kwa kila njia baada ya kutoa"],
        visual: "analytics",
      },
      {
        type: "faq",
        tone: "dark",
        eyebrow: "Maswali ya utangazaji",
        title: "Majibu ya moja kwa moja",
        items: [
          { q: "Kuwasilisha kwa wahariri kutaniweka kwenye orodha?", a: "Si lazima. Wahariri hupokea maombi mengi kuliko wanavyoweza kuchagua. Ombi zuri linaongeza nafasi; haliamui matokeo." },
          { q: "Watengeneza maudhui lazima waseme wamelipwa?", a: "Ndiyo. Kila chapisho la kampeni lazima lionyeshwe kuwa tangazo la kulipia kulingana na sheria za jukwaa na sheria za matangazo." },
          { q: "Itakuwaje mtengeneza maudhui asipoweka chapisho?", a: "Unalipia tu machapisho yaliyowekwa na yanayotimiza maelekezo. Yasiyotimiza hayalipiwi." },
        ],
        link: { label: "Soma Sera ya Matumizi Yanayokubalika", to: "/legal/acceptable-use" },
      },
    ],
    cta: { title: "Toa kwanza. Kisha tutafute wasikilizaji wako.", secondary: { label: "Kwa watengeneza maudhui", to: "/creators" } },
  },
};
