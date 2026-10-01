import type { Localized } from "@/lib/LanguageContext";

export type HelpCategory = "start" | "releases" | "stores" | "promotion" | "royalties" | "account";
export type HelpArticle = { id: string; category: HelpCategory; q: string; a: string[]; keywords?: string };
export type HelpCopy = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; lede: string };
  categories: Record<HelpCategory, string>;
  articles: HelpArticle[];
};

export const HELP: Localized<HelpCopy> = {
  EN: {
    meta: { title: "Help Center", description: "Answers about releasing music, stores, promotion, royalties and your 2kTunes account." },
    hero: { eyebrow: "Help Center", title: "How can we help?", lede: "Search our guides or browse by topic. Every answer is available in English and Kiswahili." },
    categories: {
      start: "Getting started",
      releases: "Releasing music",
      stores: "Stores & delivery",
      promotion: "Promotion",
      royalties: "Royalties & payouts",
      account: "Account & security",
    },
    articles: [
      {
        id: "what-is-2ktunes",
        category: "start",
        q: "What is 2kTunes?",
        a: [
          "2kTunes is a music distribution platform built in Tanzania. We deliver your releases to global and African streaming stores, offer promotion options including creator campaigns, and pay out your royalties to mobile money or a bank account, converted to TZS when you withdraw.",
          "You keep full ownership of your music. We act on your behalf under a non-exclusive licence you can end at any time.",
        ],
        keywords: "about distributor",
      },
      {
        id: "account-types",
        category: "start",
        q: "Which account type should I choose?",
        a: [
          "Choose Artist if you release your own music. Choose Label / Team if you manage several artists or a catalogue. Choose Creator / Influencer if you want to list paid promotion packages that artists can order to feature their music in your content.",
          "Not sure? Pick the closest one — contact support if you need to change it later.",
        ],
        keywords: "artist label creator influencer register sign up",
      },
      {
        id: "first-release",
        category: "start",
        q: "How do I release my first song?",
        a: [
          "Create an account, choose a plan, then open Upload in your dashboard. Add your audio, artwork, credits and release date, choose your stores and submit. You can save a draft at any step.",
          "After our review, your release is delivered to the stores you picked.",
        ],
        keywords: "upload start begin",
      },
      {
        id: "audio-requirements",
        category: "releases",
        q: "What audio files do you accept?",
        a: [
          "Upload lossless WAV or FLAC files at 16-bit / 44.1 kHz or higher. Most stores reject MP3s and files converted from MP3.",
          "Make sure the file is the final master, with no silence longer than a few seconds at the start or end.",
        ],
        keywords: "wav flac mp3 format quality master",
      },
      {
        id: "artwork-requirements",
        category: "releases",
        q: "What are the artwork requirements?",
        a: [
          "Square JPG or PNG, at least 3000 × 3000 pixels, in RGB. No blurry images, website addresses, social handles, pricing or store logos.",
          "The artist name and title on the cover must match the release details exactly.",
        ],
        keywords: "cover image picture jalada",
      },
      {
        id: "release-timing",
        category: "releases",
        q: "How far ahead should I schedule a release?",
        a: [
          "Submit at least two to three weeks before your release date. If you plan to pitch to store editors, submit four or more weeks ahead.",
          "Our review usually takes a few business days; each store then publishes on its own timeline.",
        ],
        keywords: "date time schedule how long",
      },
      {
        id: "review-rejected",
        category: "releases",
        q: "Why was my release sent back?",
        a: [
          "Common reasons are artwork that doesn't match the metadata, missing songwriter credits, audio quality issues or content you don't have rights to.",
          "Your dashboard shows the exact reason. Fix it and resubmit — you don't need to start again.",
        ],
        keywords: "rejected declined changes requested error",
      },
      {
        id: "which-stores",
        category: "stores",
        q: "Which stores and platforms do you deliver to?",
        a: [
          "Global services such as Spotify, Apple Music, YouTube Music, Amazon Music, Deezer and Tidal; social platforms like TikTok, Instagram and Facebook; and African platforms including Boomplay and Audiomack.",
          "We deliver through our distribution partners. Availability can vary by territory, release type and store policy. Store names are trademarks of their owners; no endorsement implied.",
        ],
        keywords: "spotify apple boomplay tiktok youtube audiomack deezer amazon",
      },
      {
        id: "move-catalogue",
        category: "stores",
        q: "Can I move my music from another distributor?",
        a: [
          "Yes. Upload the release with its existing ISRC codes and original release date, and wait until it is live through 2kTunes before taking it down at your old distributor.",
          "This keeps your play counts and playlist placements where stores support it.",
        ],
        keywords: "transfer switch migrate isrc",
      },
      {
        id: "takedown",
        category: "stores",
        q: "How do I take a release down?",
        a: [
          "Open the release in your dashboard and request a takedown. Stores usually remove it within a few days to a few weeks.",
          "Royalties already earned remain in your wallet.",
        ],
        keywords: "remove delete takedown",
      },
      {
        id: "promotion-options",
        category: "promotion",
        q: "What promotion options are there?",
        a: [
          "Four: editorial pitching to stores, independent curator services, creator campaigns, and advertising. Editorial pitching and creator campaigns are available today; independent curator services and advertising are not available yet. They work differently — see the Promotion page for who decides and what you pay for.",
          "No option guarantees streams, playlist placements or editorial features.",
        ],
        keywords: "playlist pitch marketing campaign ads",
      },
      {
        id: "fake-streams",
        category: "promotion",
        q: "Can I buy streams or followers?",
        a: [
          "No. Artificial streaming breaks store rules and can get your release removed and your earnings withheld. We don't sell it and we remove services that do.",
        ],
        keywords: "bots fake streams followers artificial",
      },
      {
        id: "when-paid",
        category: "royalties",
        q: "When will I see royalties?",
        a: [
          "Stores report earnings one to three months after streams happen. Royalties appear in your wallet once each report has been received and processed.",
        ],
        keywords: "money earnings payment when",
      },
      {
        id: "withdraw",
        category: "royalties",
        q: "How do I withdraw my earnings?",
        a: [
          "Open your wallet, choose Withdraw and pick a payout method — M-Pesa, Airtel Money, Mixx by Yas or bank transfer, where available in your country. The minimum amount, any fee and the exchange rate are shown before you confirm. The 2kTunes finance team then processes the withdrawal, and your wallet shows each step and its status.",
        ],
        keywords: "mpesa m-pesa airtel mixx yas bank cash out payout",
      },
      {
        id: "splits",
        category: "royalties",
        q: "How do royalty splits work?",
        a: [
          "Add collaborators to a release with their percentage. Each collaborator confirms by email, and future royalties for that release are divided automatically into each person's wallet.",
        ],
        keywords: "split share producer songwriter collaborator",
      },
      {
        id: "reset-password",
        category: "account",
        q: "I forgot my password.",
        a: [
          "Use “Forgot password?” on the login screen. We'll email a reset link if an account exists for that address. The link expires after a short time, so use it straight away.",
        ],
        keywords: "password reset login forgot",
      },
      {
        id: "verify-email",
        category: "account",
        q: "Why should I verify my email?",
        a: [
          "Verification confirms we can reach you about your releases and payouts. Some actions, like withdrawals, may require a verified email. You can resend the verification email from your dashboard.",
        ],
        keywords: "verify verification email confirm",
      },
      {
        id: "security",
        category: "account",
        q: "How do you keep my account safe?",
        a: [
          "Use a unique password of at least 8 characters. We never ask for your password by phone, email or social media, and we will never ask you to pay to unlock royalties.",
        ],
        keywords: "security scam safe",
      },
    ],
  },
  SW: {
    meta: { title: "Kituo cha Msaada", description: "Majibu kuhusu kutoa muziki, maduka, utangazaji, mirabaha na akaunti yako ya 2kTunes." },
    hero: { eyebrow: "Kituo cha Msaada", title: "Tukusaidie nini?", lede: "Tafuta miongozo yetu au pitia kwa mada. Kila jibu linapatikana kwa Kiingereza na Kiswahili." },
    categories: {
      start: "Kuanza",
      releases: "Kutoa muziki",
      stores: "Maduka na usambazaji",
      promotion: "Utangazaji",
      royalties: "Mirabaha na malipo",
      account: "Akaunti na usalama",
    },
    articles: [
      {
        id: "what-is-2ktunes",
        category: "start",
        q: "2kTunes ni nini?",
        a: [
          "2kTunes ni jukwaa la usambazaji wa muziki lililojengwa Tanzania. Tunasambaza matoleo yako kwenye maduka ya kimataifa na ya Afrika, tunatoa njia za utangazaji zikiwemo kampeni za watengeneza maudhui, na tunalipa mirabaha yako kwenda pesa ya simu au benki, ikibadilishwa kuwa TZS unapotoa.",
          "Unabaki na umiliki kamili wa muziki wako. Tunafanya kazi kwa niaba yako chini ya leseni isiyo ya upekee ambayo unaweza kusitisha wakati wowote.",
        ],
        keywords: "kuhusu msambazaji",
      },
      {
        id: "account-types",
        category: "start",
        q: "Nichague aina gani ya akaunti?",
        a: [
          "Chagua Msanii kama unatoa muziki wako mwenyewe. Chagua Lebo / Timu kama unasimamia wasanii kadhaa au kazi nyingi. Chagua Mtengeneza maudhui kama unataka kuorodhesha vifurushi vya utangazaji wa kulipia ambavyo wasanii wanaweza kuagiza ili muziki wao utumike kwenye maudhui yako.",
          "Huna uhakika? Chagua iliyo karibu zaidi — wasiliana na msaada ukihitaji kubadilisha baadaye.",
        ],
        keywords: "msanii lebo mtengeneza maudhui kujisajili",
      },
      {
        id: "first-release",
        category: "start",
        q: "Natoaje wimbo wangu wa kwanza?",
        a: [
          "Fungua akaunti, chagua kifurushi, kisha fungua Pakia kwenye dashibodi. Weka sauti, picha, wahusika na tarehe ya kutoa, chagua maduka na uwasilishe. Unaweza kuhifadhi rasimu kwenye hatua yoyote.",
          "Baada ya ukaguzi wetu, toleo lako linasambazwa kwenye maduka uliyochagua.",
        ],
        keywords: "pakia anza",
      },
      {
        id: "audio-requirements",
        category: "releases",
        q: "Mnakubali faili za sauti za aina gani?",
        a: [
          "Pakia faili za WAV au FLAC zisizopunguzwa ubora, 16-bit / 44.1 kHz au zaidi. Maduka mengi hukataa MP3 na faili zilizobadilishwa kutoka MP3.",
          "Hakikisha faili ni master ya mwisho, bila ukimya wa zaidi ya sekunde chache mwanzoni au mwishoni.",
        ],
        keywords: "wav flac mp3 ubora master",
      },
      {
        id: "artwork-requirements",
        category: "releases",
        q: "Masharti ya picha ya jalada ni yapi?",
        a: [
          "JPG au PNG ya mraba, angalau pikseli 3000 × 3000, kwa RGB. Isiwe na ukungu, anwani za tovuti, majina ya mitandao ya kijamii, bei wala nembo za maduka.",
          "Jina la msanii na jina la wimbo kwenye jalada lazima vilingane kabisa na taarifa za toleo.",
        ],
        keywords: "jalada picha cover",
      },
      {
        id: "release-timing",
        category: "releases",
        q: "Nipange toleo mapema kiasi gani?",
        a: [
          "Wasilisha angalau wiki mbili hadi tatu kabla ya tarehe ya kutoa. Kama unapanga kuwasilisha kwa wahariri wa maduka, wasilisha wiki nne au zaidi kabla.",
          "Ukaguzi wetu kwa kawaida huchukua siku chache za kazi; kisha kila duka huchapisha kwa ratiba yake.",
        ],
        keywords: "tarehe muda ratiba",
      },
      {
        id: "review-rejected",
        category: "releases",
        q: "Kwa nini toleo langu limerudishwa?",
        a: [
          "Sababu za kawaida ni picha isiyolingana na taarifa, kukosa majina ya watunzi, matatizo ya ubora wa sauti au maudhui ambayo huna haki nayo.",
          "Dashibodi yako inaonyesha sababu kamili. Rekebisha na uwasilishe tena — huhitaji kuanza upya.",
        ],
        keywords: "limekataliwa marekebisho hitilafu",
      },
      {
        id: "which-stores",
        category: "stores",
        q: "Mnasambaza kwenye maduka na majukwaa gani?",
        a: [
          "Huduma za kimataifa kama Spotify, Apple Music, YouTube Music, Amazon Music, Deezer na Tidal; majukwaa ya kijamii kama TikTok, Instagram na Facebook; na majukwaa ya Afrika yakiwemo Boomplay na Audiomack.",
          "Tunasambaza kupitia washirika wetu wa usambazaji. Upatikanaji unaweza kutofautiana kwa nchi, aina ya toleo na sera za duka. Majina ya maduka ni alama za biashara za wamiliki wake; hakuna uidhinishaji unaomaanishwa.",
        ],
        keywords: "spotify apple boomplay tiktok youtube audiomack deezer amazon maduka",
      },
      {
        id: "move-catalogue",
        category: "stores",
        q: "Naweza kuhamisha muziki wangu kutoka msambazaji mwingine?",
        a: [
          "Ndiyo. Pakia toleo pamoja na namba zake za ISRC na tarehe ya awali ya kutoa, na subiri liwe hewani kupitia 2kTunes kabla ya kuliondoa kwa msambazaji wako wa zamani.",
          "Hii inahifadhi idadi ya usikilizaji na nafasi kwenye orodha pale maduka yanaporuhusu.",
        ],
        keywords: "hamisha badilisha isrc",
      },
      {
        id: "takedown",
        category: "stores",
        q: "Naondoaje toleo?",
        a: [
          "Fungua toleo kwenye dashibodi na uombe liondolewe. Maduka kwa kawaida huliondoa ndani ya siku chache hadi wiki kadhaa.",
          "Mirabaha iliyokwisha kupatikana inabaki kwenye pochi yako.",
        ],
        keywords: "ondoa futa",
      },
      {
        id: "promotion-options",
        category: "promotion",
        q: "Kuna njia gani za utangazaji?",
        a: [
          "Nne: kuwasilisha kwa wahariri wa maduka, huduma za wachaguzi huru, kampeni za watengeneza maudhui, na matangazo. Kuwasilisha kwa wahariri na kampeni za watengeneza maudhui vinapatikana sasa; huduma za wachaguzi huru na matangazo bado hazipatikani. Zinafanya kazi tofauti — angalia ukurasa wa Utangazaji kujua nani anaamua na unalipia nini.",
          "Hakuna njia inayohakikisha usikilizaji, nafasi kwenye orodha au kuchaguliwa na wahariri.",
        ],
        keywords: "orodha playlist kampeni matangazo",
      },
      {
        id: "fake-streams",
        category: "promotion",
        q: "Naweza kununua usikilizaji au wafuasi?",
        a: [
          "Hapana. Usikilizaji wa kughushi unavunja sheria za maduka na unaweza kusababisha toleo lako kuondolewa na mapato kuzuiliwa. Hatuuzi huduma hiyo na tunaondoa huduma zinazoiuza.",
        ],
        keywords: "roboti kughushi wafuasi",
      },
      {
        id: "when-paid",
        category: "royalties",
        q: "Nitaona mirabaha lini?",
        a: [
          "Maduka huripoti mapato mwezi mmoja hadi mitatu baada ya usikilizaji. Mirabaha inaonekana kwenye pochi yako kila ripoti ikipokelewa na kushughulikiwa.",
        ],
        keywords: "pesa mapato malipo lini",
      },
      {
        id: "withdraw",
        category: "royalties",
        q: "Natoaje mapato yangu?",
        a: [
          "Fungua pochi yako, chagua Toa pesa na uchague njia ya malipo — M-Pesa, Airtel Money, Mixx by Yas au benki, pale zinapopatikana nchini kwako. Kiwango cha chini, ada yoyote na kiwango cha ubadilishaji vinaonyeshwa kabla ya kuthibitisha. Kisha timu ya fedha ya 2kTunes inashughulikia utoaji huo, na pochi yako inaonyesha kila hatua na hali yake.",
        ],
        keywords: "mpesa m-pesa airtel mixx yas benki kutoa",
      },
      {
        id: "splits",
        category: "royalties",
        q: "Mgawanyo wa mirabaha unafanyaje kazi?",
        a: [
          "Ongeza washirika kwenye toleo pamoja na asilimia zao. Kila mshirika anathibitisha kwa barua pepe, na mirabaha ijayo ya toleo hilo inagawanywa moja kwa moja kwenye pochi ya kila mtu.",
        ],
        keywords: "mgawanyo sehemu mtayarishaji mtunzi mshirika",
      },
      {
        id: "reset-password",
        category: "account",
        q: "Nimesahau nenosiri.",
        a: [
          "Tumia “Umesahau nenosiri?” kwenye ukurasa wa kuingia. Tutatuma kiungo cha kuweka upya kama akaunti ipo kwa anwani hiyo. Kiungo kinaisha muda baada ya muda mfupi, kwa hiyo kitumie mara moja.",
        ],
        keywords: "nenosiri weka upya kuingia",
      },
      {
        id: "verify-email",
        category: "account",
        q: "Kwa nini nithibitishe barua pepe?",
        a: [
          "Uthibitisho unahakikisha tunaweza kukufikia kuhusu matoleo na malipo yako. Baadhi ya hatua, kama kutoa pesa, zinaweza kuhitaji barua pepe iliyothibitishwa. Unaweza kutuma tena barua ya uthibitisho kutoka dashibodi.",
        ],
        keywords: "thibitisha uthibitisho barua pepe",
      },
      {
        id: "security",
        category: "account",
        q: "Mnalindaje akaunti yangu?",
        a: [
          "Tumia nenosiri la kipekee lenye angalau herufi 8. Hatutawahi kukuomba nenosiri kwa simu, barua pepe au mitandao ya kijamii, na hatutawahi kukuomba ulipe ili kufungua mirabaha.",
        ],
        keywords: "usalama utapeli",
      },
    ],
  },
};
