import type { Localized } from "@/lib/LanguageContext";

type Item = { title: string; body: string };

type HomeCopy = {
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
        "2kTunes delivers your music to the stores and platforms where people listen, helps you reach new fans through creators and campaigns, and pays your royalties out to mobile money or your bank — converted to shillings when you withdraw.",
      secondary: "How it works",
      trust: ["You keep 100% of your rights", "Withdraw to M-Pesa, Airtel Money, Mixx & banks", "Support in English & Kiswahili"],
    },
    promises: [
      {
        title: "Global distribution",
        body: "One upload reaches global streaming services, short-video apps and the African platforms your audience actually uses.",
      },
      {
        title: "African creator marketing",
        body: "Put your song in front of listeners through creator campaigns, editorial pitching and release planning built for this market.",
      },
      {
        title: "Local royalty payouts",
        body: "Earnings land in one wallet in the currency stores pay, and withdraw to M-Pesa, Airtel Money, Mixx by Yas or a bank account.",
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
      lede: "Four different routes to new listeners — and we're clear about which is which, which are available today, what it costs and what it can and can't do.",
      kinds: [
        {
          tag: "Free with your release",
          title: "Editorial pitching",
          body: "Submit an unreleased song for store editors to consider. Editors decide independently; a pitch is a request, not a placement.",
        },
        {
          tag: "Not available yet",
          title: "Curator services",
          body: "Offer your track to independent playlist curators and blogs who choose whether to feature it. You pay for review, never for a guaranteed add.",
        },
        {
          tag: "Paid campaign",
          title: "Creator campaigns",
          body: "Browse TikTok, Instagram and YouTube creators and order a package to feature your song. Creators are paid once you approve the post, and every post is disclosed as promotion.",
        },
        {
          tag: "Not available yet",
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
      lede: "Stores pay in many currencies on their own schedules. 2kTunes brings it into one wallet in the currency each store paid, and converts it to shillings when you withdraw the way you already get paid.",
      points: [
        { title: "One wallet, every store", body: "Each line traces back to a store, a territory and a reporting period." },
        { title: "Converted when you withdraw", body: "Balances stay in the currency stores pay. Withdraw to a TZS payout method and you see the exchange rate and fee before you confirm." },
        { title: "Mobile money or bank", body: "Withdraw to M-Pesa, Airtel Money, Mixx by Yas or a local bank account. Our finance team processes each request, and your dashboard shows every step." },
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
      title: "Built here, for artists here, heard everywhere.",
      lede: "Most distributors were built for other markets and bolted Africa on later. 2kTunes starts from how East African artists release, promote and get paid.",
      points: [
        { title: "African platforms included", body: "Boomplay and Audiomack sit alongside global stores, not as an afterthought." },
        { title: "Local money, local language", body: "Withdrawals in shillings to mobile money or bank, and a dashboard in English and Kiswahili." },
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
          a: "Royalties from store reports are added to your 2kTunes wallet in the currency the store paid, often US dollars. Once you pass the minimum withdrawal amount shown in your dashboard, you can withdraw to mobile money or a bank account. For a TZS payout, the exchange rate and fee are shown before you confirm, and our finance team processes the withdrawal.",
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
        "2kTunes inasambaza muziki wako kwenye maduka na majukwaa ambayo watu husikiliza, inakusaidia kufikia mashabiki wapya kupitia watengeneza maudhui na kampeni, na inakulipa mirabaha yako kwenda pesa ya simu au benki yako — ikibadilishwa kuwa shilingi unapotoa.",
      secondary: "Jinsi inavyofanya kazi",
      trust: ["Unabaki na haki zako 100%", "Toa kwenda M-Pesa, Airtel Money, Mixx na benki", "Msaada kwa Kiingereza na Kiswahili"],
    },
    promises: [
      {
        title: "Usambazaji wa kimataifa",
        body: "Upakiaji mmoja unafika kwenye huduma za kimataifa za kusikiliza, programu za video fupi na majukwaa ya Afrika ambayo hadhira yako inatumia.",
      },
      {
        title: "Utangazaji kupitia watengeneza maudhui wa Afrika",
        body: "Weka wimbo wako mbele ya wasikilizaji kupitia kampeni za watengeneza maudhui, kuwasilisha kwa wahariri na mipango ya kutoa muziki iliyoundwa kwa soko hili.",
      },
      {
        title: "Malipo ya mirabaha nyumbani",
        body: "Mapato yanaingia kwenye pochi moja kwa sarafu ambayo maduka hulipa, na unatoa kwenda M-Pesa, Airtel Money, Mixx by Yas au akaunti ya benki.",
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
      lede: "Njia nne tofauti za kufikia wasikilizaji wapya — na tuko wazi kuhusu kila moja, ipi inapatikana sasa, gharama yake na kile inachoweza na isichoweza kufanya.",
      kinds: [
        {
          tag: "Bure na toleo lako",
          title: "Kuwasilisha kwa wahariri",
          body: "Wasilisha wimbo ambao haujatoka ili wahariri wa maduka wauzingatie. Wahariri huamua wenyewe; kuwasilisha ni ombi, si uhakika wa kuwekwa.",
        },
        {
          tag: "Bado haipatikani",
          title: "Huduma za wachaguzi wa orodha",
          body: "Peleka wimbo wako kwa wachaguzi huru wa orodha za nyimbo na blogu wanaoamua kama wataushirikisha. Unalipia ukaguzi, si uhakika wa kuongezwa.",
        },
        {
          tag: "Kampeni ya kulipia",
          title: "Kampeni za watengeneza maudhui",
          body: "Pitia watengeneza maudhui wa TikTok, Instagram na YouTube na uagize kifurushi ili watumie wimbo wako. Wanalipwa baada ya wewe kuidhinisha chapisho, na kila chapisho linaonyeshwa wazi kuwa ni tangazo.",
        },
        {
          tag: "Bado haipatikani",
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
      lede: "Maduka hulipa kwa sarafu nyingi na kwa ratiba zao. 2kTunes inaleta yote kwenye pochi moja kwa sarafu ambayo kila duka lililipa, na inabadilisha kuwa shilingi unapotoa pesa kwa njia unayoitumia tayari.",
      points: [
        { title: "Pochi moja, maduka yote", body: "Kila mstari unaonyesha duka, nchi na kipindi cha ripoti." },
        { title: "Inabadilishwa unapotoa", body: "Salio linabaki kwa sarafu ambayo maduka hulipa. Ukitoa kwenda njia ya malipo ya TZS, unaona kiwango cha ubadilishaji na ada kabla ya kuthibitisha." },
        { title: "Pesa ya simu au benki", body: "Toa kwenda M-Pesa, Airtel Money, Mixx by Yas au akaunti ya benki ya ndani. Timu yetu ya fedha inashughulikia kila ombi, na dashibodi yako inaonyesha kila hatua." },
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
      title: "Imejengwa hapa, kwa wasanii wa hapa, inasikika kila mahali.",
      lede: "Wasambazaji wengi walijengwa kwa masoko mengine na Afrika ikaongezwa baadaye. 2kTunes inaanzia jinsi wasanii wa Afrika Mashariki wanavyotoa muziki, kujitangaza na kulipwa.",
      points: [
        { title: "Majukwaa ya Afrika yamo", body: "Boomplay na Audiomack yako sambamba na maduka ya kimataifa, si nyongeza ya baadaye." },
        { title: "Pesa na lugha ya nyumbani", body: "Utoaji kwa shilingi kwenda pesa ya simu au benki, na dashibodi kwa Kiingereza na Kiswahili." },
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
          a: "Mirabaha kutoka ripoti za maduka inaongezwa kwenye pochi yako ya 2kTunes kwa sarafu ambayo duka lililipa, mara nyingi dola za Marekani. Ukipita kiwango cha chini cha kutoa kinachoonyeshwa kwenye dashibodi, unaweza kutoa kwenda pesa ya simu au akaunti ya benki. Ukitoa kwa TZS, kiwango cha ubadilishaji na ada vinaonyeshwa kabla ya kuthibitisha, na timu yetu ya fedha inashughulikia utoaji huo.",
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
  FR: {
    hero: {
      eyebrow: "Distribution musicale · Conçu en Tanzanie",
      lines: ["Diffusez partout.", "Élargissez votre public.", "Soyez payé chez vous."],
      lede:
        "2kTunes distribue votre musique sur les plateformes où le public écoute, vous aide à toucher de nouveaux fans grâce aux créateurs et aux campagnes, et vous verse vos royalties sur mobile money ou sur votre compte bancaire — converties en shillings au moment du retrait.",
      secondary: "Comment ça marche",
      trust: ["Vous conservez 100 % de vos droits", "Retraits vers M-Pesa, Airtel Money, Mixx et banques", "Assistance en anglais et en kiswahili"],
    },
    promises: [
      {
        title: "Distribution mondiale",
        body: "Un seul envoi suffit pour atteindre les services de streaming mondiaux, les applis de vidéo courte et les plateformes africaines que votre public utilise vraiment.",
      },
      {
        title: "Marketing avec des créateurs africains",
        body: "Faites découvrir votre titre grâce aux campagnes de créateurs, aux propositions éditoriales et à une planification de sortie pensée pour ce marché.",
      },
      {
        title: "Royalties versées localement",
        body: "Vos revenus arrivent dans un seul portefeuille, dans la devise versée par les plateformes, et se retirent vers M-Pesa, Airtel Money, Mixx by Yas ou un compte bancaire.",
      },
    ],
    stores: {
      eyebrow: "Où va votre musique",
      title: "Les plateformes que votre public utilise déjà.",
      lede: "Choisissez vos destinations pour chaque sortie. Nous gérons les formats de livraison, les métadonnées et les exigences des plateformes à votre place.",
    },
    workflow: {
      eyebrow: "Comment ça marche",
      title: "De l’envoi au retrait, en cinq étapes claires.",
      lede: "Chaque sortie suit le même parcours visible, et vous savez à tout moment où en est la vôtre.",
      steps: [
        { title: "Envoi", body: "Ajoutez votre audio, votre pochette, les crédits et la date de sortie grâce à un parcours guidé." },
        { title: "Vérification", body: "Notre équipe contrôle l’audio, la pochette et les métadonnées selon les règles des plateformes avant tout envoi." },
        { title: "En ligne", body: "Votre sortie est livrée aux plateformes choisies et devient disponible à la date prévue." },
        { title: "Revenus", body: "Les rapports des plateformes arrivent sous forme de royalties dans votre portefeuille, détaillées par plateforme, pays et période." },
        { title: "Retrait", body: "Retirez vers mobile money ou votre banque dès que vous atteignez le solde minimum." },
      ],
    },
    promotion: {
      eyebrow: "Promotion",
      title: "La distribution vous rend visible. La promotion vous fait entendre.",
      lede: "Quatre façons différentes de toucher de nouveaux auditeurs — et nous sommes clairs sur chacune : ce qui est disponible aujourd’hui, ce que cela coûte, ce que cela peut et ne peut pas faire.",
      kinds: [
        {
          tag: "Inclus avec votre sortie",
          title: "Proposition éditoriale",
          body: "Soumettez un titre inédit à l’attention des éditeurs des plateformes. Les éditeurs décident en toute indépendance ; une proposition est une demande, pas un placement.",
        },
        {
          tag: "Pas encore disponible",
          title: "Services de curateurs",
          body: "Proposez votre titre à des curateurs de playlists et à des blogs indépendants qui choisissent de le mettre en avant ou non. Vous payez l’écoute, jamais un ajout garanti.",
        },
        {
          tag: "Campagne payante",
          title: "Campagnes de créateurs",
          body: "Parcourez des créateurs TikTok, Instagram et YouTube et commandez une offre pour mettre votre titre en avant. Les créateurs sont payés une fois la publication approuvée par vous, et chaque publication est signalée comme promotion.",
        },
        {
          tag: "Pas encore disponible",
          title: "Publicité",
          body: "Lancez des publicités qui dirigent les auditeurs vers votre sortie sur les plateformes de votre choix, avec le budget et l’audience que vous définissez.",
        },
      ],
      note: "Personne ne peut honnêtement garantir des écoutes, des placements en playlist ou une mise en avant éditoriale — et nous ne le ferons jamais.",
      link: "Découvrir la promotion",
    },
    royalties: {
      eyebrow: "Royalties et paiements locaux",
      title: "Gagné partout. Payé chez vous.",
      lede: "Les plateformes paient dans de nombreuses devises, selon leur propre calendrier. 2kTunes regroupe tout dans un seul portefeuille, dans la devise versée par chaque plateforme, et convertit en shillings lorsque vous retirez, par le moyen de paiement que vous utilisez déjà.",
      points: [
        { title: "Un portefeuille, toutes les plateformes", body: "Chaque ligne renvoie à une plateforme, un territoire et une période de rapport." },
        { title: "Converti au moment du retrait", body: "Les soldes restent dans la devise versée par les plateformes. Pour un retrait en TZS, vous voyez le taux de change et les frais avant de confirmer." },
        { title: "Mobile money ou banque", body: "Retirez vers M-Pesa, Airtel Money, Mixx by Yas ou un compte bancaire local. Notre équipe financière traite chaque demande, et votre tableau de bord affiche chaque étape." },
      ],
      link: "Comment fonctionnent les royalties",
    },
    splits: {
      eyebrow: "Partages de revenus",
      title: "Payez tous ceux qui ont fait le titre.",
      lede: "Définissez une fois les pourcentages des producteurs, auteurs-compositeurs et artistes invités. Chaque collaborateur reçoit sa part dans son propre portefeuille.",
      points: ["Invitez vos collaborateurs par e-mail", "Les partages s’appliquent à tous les relevés à venir", "Tout le monde voit les mêmes chiffres"],
    },
    analytics: {
      eyebrow: "Statistiques",
      title: "Voyez où votre musique progresse.",
      lede: "Sachez quels titres décollent, quels pays écoutent et quelles plateformes les diffusent — pour que votre prochaine sortie soit une décision, pas un pari.",
      points: ["Écoutes et revenus par sortie", "Principaux territoires et plateformes", "Tendances au fil des rapports des plateformes"],
    },
    africa: {
      eyebrow: "L’Afrique d’abord",
      title: "Conçu ici, pour les artistes d’ici — entendu partout.",
      lede: "La plupart des distributeurs ont été pensés pour d’autres marchés, l’Afrique ajoutée après coup. 2kTunes part de la façon dont les artistes d’Afrique de l’Est sortent leur musique, se font connaître et sont payés.",
      points: [
        { title: "Plateformes africaines incluses", body: "Boomplay et Audiomack figurent aux côtés des plateformes mondiales, pas en option de dernière minute." },
        { title: "Argent local, langue locale", body: "Retraits en shillings vers mobile money ou banque, et un tableau de bord en anglais et en kiswahili." },
        { title: "Une équipe qui connaît la scène", body: "Assistance et planification de campagnes par une équipe qui travaille chaque jour avec des artistes d’Afrique de l’Est." },
      ],
    },
    pricing: {
      eyebrow: "Tarifs",
      title: "Des offres simples, au juste prix.",
      lede: "Les offres dépendent du nombre de profils d’artistes que vous gérez. Vous conservez vos droits avec chaque offre.",
      link: "Comparer les offres",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Les premières questions des artistes.",
      items: [
        {
          q: "Combien de temps avant que ma musique soit en ligne ?",
          a: "Notre vérification prend généralement quelques jours ouvrés, puis chaque plateforme publie selon son propre calendrier. Soumettez votre sortie au moins deux à trois semaines avant la date prévue — quatre ou plus si vous souhaitez une proposition éditoriale.",
        },
        {
          q: "Est-ce que je conserve les droits sur ma musique ?",
          a: "Oui. Vous conservez 100 % de la propriété de vos masters et de vos compositions. Vous accordez à 2kTunes une licence pour distribuer en votre nom, et vous pouvez retirer une sortie à tout moment.",
        },
        {
          q: "Comment suis-je payé ?",
          a: "Les royalties issues des rapports des plateformes sont ajoutées à votre portefeuille 2kTunes dans la devise versée par la plateforme, souvent en dollars américains. Une fois le montant minimum de retrait indiqué dans votre tableau de bord atteint, vous pouvez retirer vers mobile money ou un compte bancaire. Pour un paiement en TZS, le taux de change et les frais sont affichés avant confirmation, et notre équipe financière traite le retrait.",
        },
        {
          q: "Pouvez-vous garantir des écoutes ou des placements en playlist ?",
          a: "Non, et méfiez-vous de quiconque le promet. Les équipes éditoriales et les curateurs indépendants font leurs propres choix. Nous vous aidons à bien présenter votre titre, à toucher des créateurs et à planifier votre sortie — les résultats dépendent de la musique et du public.",
        },
        {
          q: "Puis-je partager les royalties avec mes collaborateurs ?",
          a: "Oui. Ajoutez des producteurs, auteurs-compositeurs ou artistes invités à une sortie avec leur pourcentage, et la part de chacun est versée dans son propre portefeuille.",
        },
        {
          q: "Sur quelles plateformes distribuez-vous ?",
          a: "Les services mondiaux comme Spotify, Apple Music, YouTube Music, Amazon Music et Deezer, les réseaux sociaux comme TikTok et Instagram, et des plateformes africaines dont Boomplay et Audiomack. La disponibilité peut varier selon le territoire et la sortie.",
        },
      ],
      link: "Consulter le centre d’aide",
    },
    final: {
      title: "Votre prochaine sortie commence ici.",
      lede: "Créez votre compte en une minute. Envoyez votre musique quand vous êtes prêt.",
    },
  },
};
