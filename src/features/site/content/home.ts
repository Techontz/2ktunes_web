import type { Localized } from "@/lib/LanguageContext";

type Item = { title: string; body: string };

export type HomeCopy = {
  hero: { eyebrow: string; lines: [string, string, string]; lede: string; secondary: string; trust: string[] };
  promises: [Item, Item, Item];
  stores: { eyebrow: string; title: string; lede: string };
  workflow: { eyebrow: string; title: string; lede: string; steps: Item[] };
  promotion: {
    eyebrow: string;
    title: string;
    lede: string;
    kinds: (Item & { tag: string })[];
    note: string;
    link: string;
  };
  royalties: {
    eyebrow: string;
    title: string;
    lede: string;
    points: Item[];
    link: string;
  };
  splits: { eyebrow: string; title: string; lede: string; points: string[] };
  analytics: { eyebrow: string; title: string; lede: string; points: string[] };
  africa: { eyebrow: string; title: string; lede: string; points: Item[] };
  pricing: { eyebrow: string; title: string; lede: string; link: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[]; link: string };
  final: { title: string; lede: string };
};

export const HOME: Localized<HomeCopy> = {
  EN: {
    hero: {
      eyebrow: "Music distribution · Built in Tanzania",
      lines: ["Distribute worldwide.", "Grow your audience.", "Get paid locally."],
      lede:
        "2kTunes delivers your music to the stores and platforms where people listen, helps you reach new fans through creators and campaigns, and pays your royalties out in shillings — to mobile money or your bank.",
      secondary: "How it works",
      trust: ["You keep 100% of your rights", "Royalties shown in TZS", "Support in English & Kiswahili"],
    },
    promises: [
      {
        title: "Global distribution",
        body: "One upload reaches global streaming services, short-video apps and the African platforms your audience actually uses.",
      },
      {
        title: "African creator marketing",
        body: "Put your song in front of listeners through creator campaigns, curated promotion and release planning built for this market.",
      },
      {
        title: "Local royalty payouts",
        body: "Earnings land in one wallet, shown in TZS, and withdraw to M-Pesa, Airtel Money, Mixx by Yas or a bank account.",
      },
    ],
    stores: {
      eyebrow: "Where your music goes",
      title: "The platforms your listeners already use.",
      lede: "Choose your destinations per release. We handle the delivery formats, metadata and store requirements so you don't have to.",
    },
    workflow: {
      eyebrow: "How it works",
      title: "From upload to withdrawal in five clear steps.",
      lede: "Every release moves through the same visible path, and you can see exactly where yours is at any time.",
      steps: [
        { title: "Upload", body: "Add your audio, artwork, credits and release date in a guided flow." },
        { title: "Review", body: "Our team checks audio, artwork and metadata against store rules before anything is sent." },
        { title: "Live", body: "Your release is delivered to the stores you chose and goes live on your date." },
        { title: "Earn", body: "Store reports arrive as royalties in your wallet, broken down by store, country and period." },
        { title: "Withdraw", body: "Cash out to mobile money or your bank once you reach the minimum balance." },
      ],
    },
    promotion: {
      eyebrow: "Promotion",
      title: "Distribution gets you listed. Promotion gets you heard.",
      lede: "Four different routes to new listeners — and we're clear about which is which, what it costs and what it can and can't do.",
      kinds: [
        {
          tag: "Free with your release",
          title: "Editorial pitching",
          body: "Submit an unreleased song for store editors to consider. Editors decide independently; a pitch is a request, not a placement.",
        },
        {
          tag: "Independent",
          title: "Curator services",
          body: "Offer your track to independent playlist curators and blogs who choose whether to feature it. You pay for review, never for a guaranteed add.",
        },
        {
          tag: "Paid campaign",
          title: "Creator campaigns",
          body: "Brief TikTok, Instagram and YouTube creators to use your song in their content. Creators are paid for the posts they publish, and every post is disclosed as promotion.",
        },
        {
          tag: "Paid media",
          title: "Advertising",
          body: "Run ads that point listeners to your release on the platforms you choose, with a budget and audience you set.",
        },
      ],
      note: "No one can honestly guarantee streams, playlist placements or editorial features — and we never will.",
      link: "Explore promotion",
    },
    royalties: {
      eyebrow: "Royalties & local payouts",
      title: "Earned globally. Paid out at home.",
      lede: "Stores pay in many currencies on their own schedules. 2kTunes brings it into one wallet, shows it in shillings and lets you withdraw the way you already get paid.",
      points: [
        { title: "One wallet, every store", body: "Each line traces back to a store, a territory and a reporting period." },
        { title: "TZS first", body: "Balances are shown in Tanzanian shillings, with the original currency always visible." },
        { title: "Mobile money or bank", body: "Withdraw to M-Pesa, Airtel Money, Mixx by Yas or a local bank account." },
      ],
      link: "How royalties work",
    },
    splits: {
      eyebrow: "Royalty splits",
      title: "Pay everyone who made the song.",
      lede: "Set percentages for producers, songwriters and featured artists once. Each collaborator gets their share in their own wallet.",
      points: ["Invite collaborators by email", "Splits apply to every future statement", "Everyone sees the same numbers"],
    },
    analytics: {
      eyebrow: "Analytics",
      title: "See where your music is moving.",
      lede: "Know which songs are growing, which countries are listening and which platforms carry them — so your next release is a decision, not a guess.",
      points: ["Streams and earnings by release", "Top territories and platforms", "Trends as store reports arrive"],
    },
    africa: {
      eyebrow: "Africa first",
      title: "Built here, for artists here — heard everywhere.",
      lede: "Most distributors were built for other markets and bolted Africa on later. 2kTunes starts from how East African artists release, promote and get paid.",
      points: [
        { title: "African platforms included", body: "Boomplay and Audiomack sit alongside global stores, not as an afterthought." },
        { title: "Local money, local language", body: "Shilling balances, mobile-money withdrawals and a dashboard in English and Kiswahili." },
        { title: "People who know the scene", body: "Support and campaign planning from a team that works with East African artists every day." },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Simple plans, priced for artists here.",
      lede: "Plans are based on how many artist profiles you manage. You keep your rights on every plan.",
      link: "Compare plans",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions artists ask first.",
      items: [
        {
          q: "How long until my music is live?",
          a: "Our review usually takes a few business days, then each store publishes on its own timeline. Submit at least two to three weeks before your release date — four or more if you want to pitch for editorial consideration.",
        },
        {
          q: "Do I keep the rights to my music?",
          a: "Yes. You keep 100% ownership of your masters and compositions. You grant 2kTunes a licence to distribute on your behalf, and you can take a release down at any time.",
        },
        {
          q: "How do I get paid?",
          a: "Royalties from store reports are added to your 2kTunes wallet and shown in TZS. Once you pass the minimum withdrawal amount shown in your dashboard, you can withdraw to mobile money or a bank account.",
        },
        {
          q: "Can you guarantee streams or playlist placements?",
          a: "No, and be careful of anyone who does. Editorial teams and independent curators make their own choices. We help you pitch well, reach creators and plan your release — results depend on the music and the audience.",
        },
        {
          q: "Can I split royalties with collaborators?",
          a: "Yes. Add producers, songwriters or featured artists to a release with their percentage, and each person's share goes to their own wallet.",
        },
        {
          q: "Which stores do you deliver to?",
          a: "Global services such as Spotify, Apple Music, YouTube Music, Amazon Music and Deezer, social platforms like TikTok and Instagram, and African platforms including Boomplay and Audiomack. Availability can vary by territory and release.",
        },
      ],
      link: "Visit the Help Center",
    },
    final: {
      title: "Your next release starts here.",
      lede: "Create your account in a minute. Upload when you're ready.",
    },
  },
  SW: {
    hero: {
      eyebrow: "Usambazaji wa muziki · Imejengwa Tanzania",
      lines: ["Sambaza duniani.", "Kuza hadhira yako.", "Lipwa nyumbani."],
      lede:
        "2kTunes inasambaza muziki wako kwenye maduka na majukwaa ambayo watu husikiliza, inakusaidia kufikia mashabiki wapya kupitia watengeneza maudhui na kampeni, na inakulipa mirabaha yako kwa shilingi — kwenda pesa ya simu au benki yako.",
      secondary: "Jinsi inavyofanya kazi",
      trust: ["Unabaki na haki zako 100%", "Mirabaha huonyeshwa kwa TZS", "Msaada kwa Kiingereza na Kiswahili"],
    },
    promises: [
      {
        title: "Usambazaji wa kimataifa",
        body: "Upakiaji mmoja unafika kwenye huduma za kimataifa za kusikiliza, programu za video fupi na majukwaa ya Afrika ambayo hadhira yako inatumia.",
      },
      {
        title: "Utangazaji kupitia watengeneza maudhui wa Afrika",
        body: "Weka wimbo wako mbele ya wasikilizaji kupitia kampeni za watengeneza maudhui, utangazaji maalum na mipango ya kutoa muziki iliyoundwa kwa soko hili.",
      },
      {
        title: "Malipo ya mirabaha nyumbani",
        body: "Mapato yanaingia kwenye pochi moja, yanaonyeshwa kwa TZS, na unatoa kwenda M-Pesa, Airtel Money, Mixx by Yas au akaunti ya benki.",
      },
    ],
    stores: {
      eyebrow: "Muziki wako unakwenda wapi",
      title: "Majukwaa ambayo wasikilizaji wako tayari wanatumia.",
      lede: "Chagua maeneo kwa kila toleo. Sisi tunashughulikia mifumo ya uwasilishaji, taarifa za wimbo na masharti ya maduka.",
    },
    workflow: {
      eyebrow: "Jinsi inavyofanya kazi",
      title: "Kutoka kupakia hadi kutoa pesa kwa hatua tano.",
      lede: "Kila toleo linapita njia ileile inayoonekana, na unaweza kuona toleo lako liko wapi wakati wowote.",
      steps: [
        { title: "Pakia", body: "Weka sauti, picha ya jalada, wahusika na tarehe ya kutoa kupitia hatua zinazokuongoza." },
        { title: "Ukaguzi", body: "Timu yetu inakagua sauti, picha na taarifa kulingana na masharti ya maduka kabla ya kutuma." },
        { title: "Hewani", body: "Toleo lako linasambazwa kwenye maduka uliyochagua na linaanza kusikika tarehe yako." },
        { title: "Pata mapato", body: "Ripoti za maduka zinaingia kama mirabaha kwenye pochi yako, kwa duka, nchi na kipindi." },
        { title: "Toa pesa", body: "Toa kwenda pesa ya simu au benki ukifikia kiwango cha chini." },
      ],
    },
    promotion: {
      eyebrow: "Utangazaji",
      title: "Usambazaji unakuweka dukani. Utangazaji unakufanya usikike.",
      lede: "Njia nne tofauti za kufikia wasikilizaji wapya — na tuko wazi kuhusu kila moja, gharama yake na kile inachoweza na isichoweza kufanya.",
      kinds: [
        {
          tag: "Bure na toleo lako",
          title: "Kuwasilisha kwa wahariri",
          body: "Wasilisha wimbo ambao haujatoka ili wahariri wa maduka wauzingatie. Wahariri huamua wenyewe; kuwasilisha ni ombi, si uhakika wa kuwekwa.",
        },
        {
          tag: "Huru",
          title: "Huduma za wachaguzi wa orodha",
          body: "Peleka wimbo wako kwa wachaguzi huru wa orodha za nyimbo na blogu wanaoamua kama wataushirikisha. Unalipia ukaguzi, si uhakika wa kuongezwa.",
        },
        {
          tag: "Kampeni ya kulipia",
          title: "Kampeni za watengeneza maudhui",
          body: "Waelekeze watengeneza maudhui wa TikTok, Instagram na YouTube kutumia wimbo wako. Wanalipwa kwa machapisho wanayoweka, na kila chapisho linaonyeshwa wazi kuwa ni tangazo.",
        },
        {
          tag: "Matangazo ya kulipia",
          title: "Matangazo",
          body: "Endesha matangazo yanayowaelekeza wasikilizaji kwenye toleo lako kwenye majukwaa unayochagua, kwa bajeti na hadhira unayoweka.",
        },
      ],
      note: "Hakuna anayeweza kwa uaminifu kuhakikisha idadi ya usikilizaji, kuwekwa kwenye orodha au kuchaguliwa na wahariri — na sisi hatutafanya hivyo.",
      link: "Angalia utangazaji",
    },
    royalties: {
      eyebrow: "Mirabaha na malipo ya ndani",
      title: "Unapata duniani. Unalipwa nyumbani.",
      lede: "Maduka hulipa kwa sarafu nyingi na kwa ratiba zao. 2kTunes inaleta yote kwenye pochi moja, inaonyesha kwa shilingi na inakuruhusu kutoa pesa kwa njia unayoitumia tayari.",
      points: [
        { title: "Pochi moja, maduka yote", body: "Kila mstari unaonyesha duka, nchi na kipindi cha ripoti." },
        { title: "TZS kwanza", body: "Salio linaonyeshwa kwa shilingi za Tanzania, na sarafu ya asili inaonekana daima." },
        { title: "Pesa ya simu au benki", body: "Toa kwenda M-Pesa, Airtel Money, Mixx by Yas au akaunti ya benki ya ndani." },
      ],
      link: "Jinsi mirabaha inavyofanya kazi",
    },
    splits: {
      eyebrow: "Mgawanyo wa mirabaha",
      title: "Mlipe kila aliyeshiriki kutengeneza wimbo.",
      lede: "Weka asilimia za watayarishaji, watunzi na wasanii walioshirikishwa mara moja. Kila mshirika anapata sehemu yake kwenye pochi yake.",
      points: ["Waalike washirika kwa barua pepe", "Mgawanyo unatumika kwa ripoti zote zijazo", "Kila mtu anaona takwimu zilezile"],
    },
    analytics: {
      eyebrow: "Takwimu",
      title: "Ona muziki wako unasikilizwa wapi.",
      lede: "Jua nyimbo zipi zinakua, nchi zipi zinasikiliza na majukwaa yapi yanazibeba — ili toleo lako lijalo liwe uamuzi, si kubahatisha.",
      points: ["Usikilizaji na mapato kwa kila toleo", "Nchi na majukwaa yanayoongoza", "Mwenendo kadiri ripoti za maduka zinavyofika"],
    },
    africa: {
      eyebrow: "Afrika kwanza",
      title: "Imejengwa hapa, kwa wasanii wa hapa — inasikika kila mahali.",
      lede: "Wasambazaji wengi walijengwa kwa masoko mengine na Afrika ikaongezwa baadaye. 2kTunes inaanzia jinsi wasanii wa Afrika Mashariki wanavyotoa muziki, kujitangaza na kulipwa.",
      points: [
        { title: "Majukwaa ya Afrika yamo", body: "Boomplay na Audiomack yako sambamba na maduka ya kimataifa, si nyongeza ya baadaye." },
        { title: "Pesa na lugha ya nyumbani", body: "Salio kwa shilingi, utoaji kwenda pesa ya simu na dashibodi kwa Kiingereza na Kiswahili." },
        { title: "Watu wanaoijua tasnia", body: "Msaada na mipango ya kampeni kutoka kwa timu inayofanya kazi na wasanii wa Afrika Mashariki kila siku." },
      ],
    },
    pricing: {
      eyebrow: "Bei",
      title: "Vifurushi rahisi, kwa bei ya wasanii wa hapa.",
      lede: "Vifurushi vinategemea idadi ya wasifu wa wasanii unaosimamia. Unabaki na haki zako kwenye kila kifurushi.",
      link: "Linganisha vifurushi",
    },
    faq: {
      eyebrow: "Maswali",
      title: "Maswali ambayo wasanii huuliza kwanza.",
      items: [
        {
          q: "Inachukua muda gani muziki wangu kuwa hewani?",
          a: "Ukaguzi wetu kwa kawaida huchukua siku chache za kazi, kisha kila duka huchapisha kwa ratiba yake. Wasilisha angalau wiki mbili hadi tatu kabla ya tarehe ya kutoa — wiki nne au zaidi kama unataka kuwasilisha kwa wahariri.",
        },
        {
          q: "Je, nabaki na haki za muziki wangu?",
          a: "Ndiyo. Unabaki na umiliki wa 100% wa master na utunzi wako. Unaipa 2kTunes leseni ya kusambaza kwa niaba yako, na unaweza kuondoa toleo wakati wowote.",
        },
        {
          q: "Nalipwaje?",
          a: "Mirabaha kutoka ripoti za maduka inaongezwa kwenye pochi yako ya 2kTunes na kuonyeshwa kwa TZS. Ukipita kiwango cha chini cha kutoa kinachoonyeshwa kwenye dashibodi, unaweza kutoa kwenda pesa ya simu au akaunti ya benki.",
        },
        {
          q: "Mnaweza kuhakikisha usikilizaji au kuwekwa kwenye orodha?",
          a: "Hapana, na kuwa makini na yeyote anayeahidi hivyo. Wahariri na wachaguzi huru hufanya maamuzi yao. Tunakusaidia kuwasilisha vizuri, kufikia watengeneza maudhui na kupanga toleo lako — matokeo hutegemea muziki na hadhira.",
        },
        {
          q: "Naweza kugawana mirabaha na washirika?",
          a: "Ndiyo. Ongeza watayarishaji, watunzi au wasanii walioshirikishwa kwenye toleo pamoja na asilimia zao, na sehemu ya kila mtu inakwenda kwenye pochi yake.",
        },
        {
          q: "Mnasambaza kwenye maduka gani?",
          a: "Huduma za kimataifa kama Spotify, Apple Music, YouTube Music, Amazon Music na Deezer, majukwaa ya kijamii kama TikTok na Instagram, na majukwaa ya Afrika yakiwemo Boomplay na Audiomack. Upatikanaji unaweza kutofautiana kwa nchi na toleo.",
        },
      ],
      link: "Tembelea Kituo cha Msaada",
    },
    final: {
      title: "Toleo lako lijalo linaanzia hapa.",
      lede: "Fungua akaunti kwa dakika moja. Pakia ukiwa tayari.",
    },
  },
};
