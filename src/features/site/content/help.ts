import type { Localized } from "@/lib/LanguageContext";

export type HelpCategory = "start" | "releases" | "stores" | "promotion" | "royalties" | "account";
export type HelpArticle = { id: string; category: HelpCategory; q: string; a: string[]; keywords?: string };
type HelpCopy = {
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
          "Not sure? Pick the closest one, and contact support if you need to change it later.",
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
          "Your dashboard shows the exact reason. Fix it and resubmit. You don't need to start again.",
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
          "Four: editorial pitching to stores, independent curator services, creator campaigns, and advertising. Editorial pitching and creator campaigns are available today; independent curator services and advertising are not available yet. They work differently, so see the Promotion page for who decides and what you pay for.",
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
          "Open your wallet, choose Withdraw and pick a payout method: M-Pesa, Airtel Money, Mixx by Yas or bank transfer, where available in your country. The minimum amount, any fee and the exchange rate are shown before you confirm. The 2kTunes finance team then processes the withdrawal, and your wallet shows each step and its status.",
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
          "Huna uhakika? Chagua iliyo karibu zaidi, kisha wasiliana na msaada ukihitaji kubadilisha baadaye.",
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
          "Dashibodi yako inaonyesha sababu kamili. Rekebisha na uwasilishe tena. Huhitaji kuanza upya.",
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
          "Nne: kuwasilisha kwa wahariri wa maduka, huduma za wachaguzi huru, kampeni za watengeneza maudhui, na matangazo. Kuwasilisha kwa wahariri na kampeni za watengeneza maudhui vinapatikana sasa; huduma za wachaguzi huru na matangazo bado hazipatikani. Zinafanya kazi tofauti, kwa hiyo angalia ukurasa wa Utangazaji kujua nani anaamua na unalipia nini.",
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
          "Fungua pochi yako, chagua Toa pesa na uchague njia ya malipo: M-Pesa, Airtel Money, Mixx by Yas au benki, pale zinapopatikana nchini kwako. Kiwango cha chini, ada yoyote na kiwango cha ubadilishaji vinaonyeshwa kabla ya kuthibitisha. Kisha timu ya fedha ya 2kTunes inashughulikia utoaji huo, na pochi yako inaonyesha kila hatua na hali yake.",
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
  FR: {
    meta: { title: "Centre d’aide", description: "Réponses sur la sortie de musique, les plateformes, la promotion, les royalties et votre compte 2kTunes." },
    hero: { eyebrow: "Centre d’aide", title: "Comment pouvons-nous aider ?", lede: "Recherchez dans nos guides ou parcourez par thème. Chaque réponse est disponible en anglais, en kiswahili et en français." },
    categories: {
      start: "Premiers pas",
      releases: "Sortir sa musique",
      stores: "Plateformes et livraison",
      promotion: "Promotion",
      royalties: "Royalties et paiements",
      account: "Compte et sécurité",
    },
    articles: [
      {
        id: "what-is-2ktunes",
        category: "start",
        q: "Qu’est-ce que 2kTunes ?",
        a: [
          "2kTunes est une plateforme de distribution musicale conçue en Tanzanie. Nous livrons vos sorties aux plateformes de streaming mondiales et africaines, proposons des options de promotion dont les campagnes de créateurs, et vous versons vos royalties sur mobile money ou sur un compte bancaire, converties en TZS au moment du retrait.",
          "Vous restez entièrement propriétaire de votre musique. Nous agissons en votre nom dans le cadre d’une licence non exclusive que vous pouvez résilier à tout moment.",
        ],
        keywords: "à propos distributeur",
      },
      {
        id: "account-types",
        category: "start",
        q: "Quel type de compte choisir ?",
        a: [
          "Choisissez Artiste si vous sortez votre propre musique. Choisissez Label / Équipe si vous gérez plusieurs artistes ou un catalogue. Choisissez Créateur / Influenceur si vous souhaitez proposer des offres de promotion payantes que les artistes peuvent commander pour mettre leur musique en avant dans vos contenus.",
          "Vous hésitez ? Choisissez le plus proche, puis contactez l’assistance si vous devez le modifier plus tard.",
        ],
        keywords: "artiste label créateur influenceur inscription s’inscrire",
      },
      {
        id: "first-release",
        category: "start",
        q: "Comment sortir mon premier titre ?",
        a: [
          "Créez un compte, choisissez une offre, puis ouvrez Nouvelle sortie dans votre tableau de bord. Ajoutez votre audio, votre pochette, les crédits et la date de sortie, choisissez vos plateformes et soumettez. Vous pouvez enregistrer un brouillon à chaque étape.",
          "Après notre vérification, votre sortie est livrée aux plateformes que vous avez choisies.",
        ],
        keywords: "envoi importer commencer débuter",
      },
      {
        id: "audio-requirements",
        category: "releases",
        q: "Quels fichiers audio acceptez-vous ?",
        a: [
          "Envoyez des fichiers WAV ou FLAC sans perte, en 16 bits / 44,1 kHz ou plus. La plupart des plateformes refusent les MP3 et les fichiers convertis depuis un MP3.",
          "Assurez-vous qu’il s’agit du master final, sans silence de plus de quelques secondes au début ou à la fin.",
        ],
        keywords: "wav flac mp3 format qualité master",
      },
      {
        id: "artwork-requirements",
        category: "releases",
        q: "Quelles sont les exigences pour la pochette ?",
        a: [
          "JPG ou PNG carré, d’au moins 3000 × 3000 pixels, en RVB. Pas d’images floues, d’adresses de sites web, de pseudos de réseaux sociaux, de prix ni de logos de plateformes.",
          "Le nom de l’artiste et le titre figurant sur la pochette doivent correspondre exactement aux informations de la sortie.",
        ],
        keywords: "pochette image visuel cover",
      },
      {
        id: "release-timing",
        category: "releases",
        q: "Combien de temps à l’avance programmer une sortie ?",
        a: [
          "Soumettez votre sortie au moins deux à trois semaines avant la date prévue. Si vous souhaitez la proposer aux éditeurs des plateformes, soumettez-la quatre semaines ou plus à l’avance.",
          "Notre vérification prend généralement quelques jours ouvrés ; chaque plateforme publie ensuite selon son propre calendrier.",
        ],
        keywords: "date délai programmer combien de temps",
      },
      {
        id: "review-rejected",
        category: "releases",
        q: "Pourquoi ma sortie m’a-t-elle été renvoyée ?",
        a: [
          "Les raisons les plus courantes : une pochette qui ne correspond pas aux métadonnées, des crédits d’auteurs-compositeurs manquants, des problèmes de qualité audio ou un contenu sur lequel vous ne détenez pas les droits.",
          "Votre tableau de bord indique la raison exacte. Corrigez-la et soumettez à nouveau. Inutile de tout recommencer.",
        ],
        keywords: "refusée rejetée modifications demandées erreur",
      },
      {
        id: "which-stores",
        category: "stores",
        q: "Sur quelles plateformes distribuez-vous ?",
        a: [
          "Les services mondiaux comme Spotify, Apple Music, YouTube Music, Amazon Music, Deezer et Tidal ; les réseaux sociaux comme TikTok, Instagram et Facebook ; et des plateformes africaines dont Boomplay et Audiomack.",
          "Nous livrons via nos partenaires de distribution. La disponibilité peut varier selon le territoire, le type de sortie et la politique de chaque plateforme. Les noms des plateformes sont des marques de leurs propriétaires respectifs ; aucune approbation n’est sous-entendue.",
        ],
        keywords: "spotify apple boomplay tiktok youtube audiomack deezer amazon plateformes",
      },
      {
        id: "move-catalogue",
        category: "stores",
        q: "Puis-je transférer ma musique depuis un autre distributeur ?",
        a: [
          "Oui. Envoyez la sortie avec ses codes ISRC existants et sa date de sortie d’origine, et attendez qu’elle soit en ligne via 2kTunes avant de la retirer chez votre ancien distributeur.",
          "Cela permet de conserver vos compteurs d’écoutes et vos placements en playlist lorsque les plateformes le permettent.",
        ],
        keywords: "transfert changer migrer isrc",
      },
      {
        id: "takedown",
        category: "stores",
        q: "Comment retirer une sortie ?",
        a: [
          "Ouvrez la sortie dans votre tableau de bord et demandez son retrait. Les plateformes la retirent généralement en quelques jours à quelques semaines.",
          "Les royalties déjà acquises restent dans votre portefeuille.",
        ],
        keywords: "retirer supprimer retrait",
      },
      {
        id: "promotion-options",
        category: "promotion",
        q: "Quelles options de promotion existent ?",
        a: [
          "Quatre : la proposition éditoriale aux plateformes, les services de curateurs indépendants, les campagnes de créateurs et la publicité. La proposition éditoriale et les campagnes de créateurs sont disponibles dès aujourd’hui ; les services de curateurs indépendants et la publicité ne le sont pas encore. Elles fonctionnent différemment : consultez la page Promotion pour savoir qui décide et ce que vous payez.",
          "Aucune option ne garantit des écoutes, des placements en playlist ou une mise en avant éditoriale.",
        ],
        keywords: "playlist proposition marketing campagne publicité",
      },
      {
        id: "fake-streams",
        category: "promotion",
        q: "Puis-je acheter des écoutes ou des abonnés ?",
        a: [
          "Non. Les écoutes artificielles enfreignent les règles des plateformes et peuvent entraîner le retrait de votre sortie et la retenue de vos revenus. Nous n’en vendons pas et nous retirons les services qui en vendent.",
        ],
        keywords: "bots fausses écoutes abonnés artificielles",
      },
      {
        id: "when-paid",
        category: "royalties",
        q: "Quand verrai-je mes royalties ?",
        a: [
          "Les plateformes communiquent les revenus un à trois mois après les écoutes. Les royalties apparaissent dans votre portefeuille dès que chaque rapport a été reçu et traité.",
        ],
        keywords: "argent revenus paiement quand",
      },
      {
        id: "withdraw",
        category: "royalties",
        q: "Comment retirer mes revenus ?",
        a: [
          "Ouvrez votre portefeuille, choisissez Retirer et sélectionnez un moyen de paiement : M-Pesa, Airtel Money, Mixx by Yas ou virement bancaire, selon la disponibilité dans votre pays. Le montant minimum, les éventuels frais et le taux de change sont affichés avant confirmation. L’équipe financière de 2kTunes traite ensuite le retrait, et votre portefeuille affiche chaque étape et son statut.",
        ],
        keywords: "mpesa m-pesa airtel mixx yas banque retrait paiement",
      },
      {
        id: "splits",
        category: "royalties",
        q: "Comment fonctionnent les partages de revenus ?",
        a: [
          "Ajoutez des collaborateurs à une sortie avec leur pourcentage. Chaque collaborateur confirme par e-mail, et les futures royalties de cette sortie sont automatiquement réparties dans le portefeuille de chacun.",
        ],
        keywords: "partage part producteur auteur compositeur collaborateur",
      },
      {
        id: "reset-password",
        category: "account",
        q: "J’ai oublié mon mot de passe.",
        a: [
          "Utilisez « Mot de passe oublié ? » sur l’écran de connexion. Nous enverrons un lien de réinitialisation par e-mail si un compte existe pour cette adresse. Le lien expire rapidement, utilisez-le sans attendre.",
        ],
        keywords: "mot de passe réinitialiser connexion oublié",
      },
      {
        id: "verify-email",
        category: "account",
        q: "Pourquoi vérifier mon adresse e-mail ?",
        a: [
          "La vérification confirme que nous pouvons vous joindre au sujet de vos sorties et de vos paiements. Certaines actions, comme les retraits, peuvent nécessiter une adresse e-mail vérifiée. Vous pouvez renvoyer l’e-mail de vérification depuis votre tableau de bord.",
        ],
        keywords: "vérifier vérification e-mail email confirmer",
      },
      {
        id: "security",
        category: "account",
        q: "Comment protégez-vous mon compte ?",
        a: [
          "Utilisez un mot de passe unique d’au moins 8 caractères. Nous ne vous demanderons jamais votre mot de passe par téléphone, e-mail ou réseaux sociaux, et nous ne vous demanderons jamais de payer pour débloquer des royalties.",
        ],
        keywords: "sécurité arnaque protection",
      },
    ],
  },
};
