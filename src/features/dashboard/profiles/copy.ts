/** Copy for /dashboard/profiles (artist profile claims). No em or en dashes. */

type Service = "spotify" | "apple_music" | "youtube_oac" | "tidal";

const EN = {
  title: "Artist profiles",
  description:
    "Get access to your official artist profiles on the big streaming services. We send the request for you and keep you posted here.",
  selectArtist: "Select an artist",
  selectPlaceholder: "Choose an artist",
  noArtists: "You don't have an artist yet.",
  addArtist: "Add an artist",
  needsReleaseHint: "This artist has no release delivered to stores yet. Requests open after the first delivery.",
  services: {
    spotify: {
      name: "Spotify for Artists",
      body: "Edit your artist picture and bio, pitch new songs and see who is listening.",
    },
    apple_music: {
      name: "Apple Music for Artists",
      body: "See plays, Shazams and listener locations, and keep your artist details up to date.",
    },
    youtube_oac: {
      name: "YouTube Official Artist Channel",
      body: "Bring your music, videos and subscribers together in one verified channel with a music note badge.",
    },
    tidal: {
      name: "Tidal",
      body: "Get your artist page verified so you can update your profile and see how your music performs.",
    },
  } as Record<Service, { name: string; body: string }>,
  requestAccess: "Request access",
  request: "Request",
  requestVerification: "Request verification",
  spotifyNote: "We pass your request on and you get an email once access is ready.",
  appleNote: "We pass your request on and you get an email once access is ready.",
  appleNotFound: "Can't find your artist after it's ready? Sign up directly at",
  appleLink: "artists.apple.com",
  youtubeLegend: "Which of these fits this artist?",
  youtubeOptions: {
    none: { label: "No channel yet", hint: "We create the official channel from the music you release." },
    shared: {
      label: "A channel shared with other artists",
      hint: "For example a label, group or family channel. We start the official channel from your music only.",
    },
    dedicated: {
      label: "A channel just for this artist",
      hint: "We combine it with your music into one official channel. Add the channel link below.",
    },
  } as Record<"none" | "shared" | "dedicated", { label: string; hint: string }>,
  channelUrl: "Channel link",
  channelUrlHint: "For example https://www.youtube.com/@yourname",
  channelUrlRequired: "Paste the link to this artist's channel.",
  channelUrlInvalid: "Paste a full YouTube channel link, like https://www.youtube.com/@yourname",
  channelOptionRequired: "Choose one option.",
  tidalStepsTitle: "Before you request",
  tidalSteps: [
    "Sign in to tidal.com, or create a free account there.",
    "Check that your music is live on Tidal under this artist name.",
    "Use the same email address as your 2kTunes account so we can match you.",
  ],
  sent: "Request sent. We'll email you when there's news.",
  alreadyOpen: "There's already an open request for this artist. We'll update it here.",
  needsRelease: (artist: string) =>
    `${artist} needs at least one release delivered to stores before you can request this. Release music under this artist first, then come back.`,
  goToMusic: "Go to my music",
  notAvailable: "Requests can't be sent right now because this feature is still being switched on. Please try again a little later.",
  claimsTitle: (artist: string) => `Requests for ${artist}`,
  claimsEmpty: "No requests yet.",
  claimsLoading: "Loading requests...",
  requestedOn: (date: string) => `Requested ${date}`,
  status: {
    requested: "Requested",
    in_progress: "In progress",
    completed: "Completed",
    rejected: "Not approved",
  } as Record<string, string>,
};

const SW: typeof EN = {
  title: "Wasifu za msanii",
  description:
    "Pata udhibiti wa wasifu rasmi wa msanii wako kwenye huduma kubwa za kusikiliza muziki. Tunatuma ombi kwa niaba yako na kukujulisha hapa.",
  selectArtist: "Chagua msanii",
  selectPlaceholder: "Chagua msanii",
  noArtists: "Bado huna msanii.",
  addArtist: "Ongeza msanii",
  needsReleaseHint: "Msanii huyu bado hana kazi iliyofikishwa kwenye maduka. Maombi yanafunguka baada ya kazi ya kwanza kufikishwa.",
  services: {
    spotify: {
      name: "Spotify for Artists",
      body: "Badilisha picha na wasifu wa msanii, pendekeza nyimbo mpya na uone nani anasikiliza.",
    },
    apple_music: {
      name: "Apple Music for Artists",
      body: "Ona idadi ya usikilizaji, Shazam na mahali wasikilizaji walipo, na uweke taarifa za msanii zikiwa sahihi.",
    },
    youtube_oac: {
      name: "YouTube Official Artist Channel",
      body: "Unganisha muziki, video na wafuasi wako kwenye chaneli moja rasmi yenye alama ya noti ya muziki.",
    },
    tidal: {
      name: "Tidal",
      body: "Thibitisha ukurasa wa msanii wako ili uweze kubadilisha wasifu na kuona muziki wako unavyofanya.",
    },
  },
  requestAccess: "Omba ufikiaji",
  request: "Omba",
  requestVerification: "Omba uthibitisho",
  spotifyNote: "Tunawasilisha ombi lako na utapokea barua pepe pale ufikiaji utakapokuwa tayari.",
  appleNote: "Tunawasilisha ombi lako na utapokea barua pepe pale ufikiaji utakapokuwa tayari.",
  appleNotFound: "Humpati msanii wako baada ya kuwa tayari? Jisajili moja kwa moja kwenye",
  appleLink: "artists.apple.com",
  youtubeLegend: "Kipi kati ya hivi kinamfaa msanii huyu?",
  youtubeOptions: {
    none: { label: "Bado hana chaneli", hint: "Tunatengeneza chaneli rasmi kutokana na muziki unaoutoa." },
    shared: {
      label: "Chaneli anayoshiriki na wasanii wengine",
      hint: "Kwa mfano chaneli ya lebo, kundi au familia. Tunaanzisha chaneli rasmi kutokana na muziki wako pekee.",
    },
    dedicated: {
      label: "Chaneli ya msanii huyu pekee",
      hint: "Tunaiunganisha na muziki wako kuwa chaneli moja rasmi. Weka kiungo cha chaneli hapa chini.",
    },
  },
  channelUrl: "Kiungo cha chaneli",
  channelUrlHint: "Kwa mfano https://www.youtube.com/@jinalako",
  channelUrlRequired: "Bandika kiungo cha chaneli ya msanii huyu.",
  channelUrlInvalid: "Bandika kiungo kamili cha chaneli ya YouTube, kama https://www.youtube.com/@jinalako",
  channelOptionRequired: "Chagua chaguo moja.",
  tidalStepsTitle: "Kabla ya kuomba",
  tidalSteps: [
    "Ingia kwenye tidal.com, au fungua akaunti ya bure huko.",
    "Hakikisha muziki wako unapatikana Tidal chini ya jina la msanii huyu.",
    "Tumia barua pepe ile ile ya akaunti yako ya 2kTunes ili tukutambue.",
  ],
  sent: "Ombi limetumwa. Tutakutumia barua pepe kukiwa na habari.",
  alreadyOpen: "Tayari kuna ombi lililo wazi kwa msanii huyu. Tutalisasisha hapa.",
  needsRelease: (artist) =>
    `${artist} anahitaji angalau kazi moja iliyofikishwa kwenye maduka kabla ya kuomba hili. Toa muziki chini ya msanii huyu kwanza, kisha urudi.`,
  goToMusic: "Nenda kwenye muziki wangu",
  notAvailable: "Maombi hayawezi kutumwa sasa kwa sababu huduma hii bado inawashwa. Tafadhali jaribu tena baadaye kidogo.",
  claimsTitle: (artist) => `Maombi ya ${artist}`,
  claimsEmpty: "Bado hakuna maombi.",
  claimsLoading: "Inapakia maombi...",
  requestedOn: (date) => `Iliombwa ${date}`,
  status: {
    requested: "Limeombwa",
    in_progress: "Linashughulikiwa",
    completed: "Limekamilika",
    rejected: "Halikukubaliwa",
  },
};

const FR: typeof EN = {
  title: "Profils d'artiste",
  description:
    "Obtenez l'accès à vos profils d'artiste officiels sur les grands services de streaming. Nous envoyons la demande pour vous et vous tenons informé ici.",
  selectArtist: "Sélectionnez un artiste",
  selectPlaceholder: "Choisissez un artiste",
  noArtists: "Vous n'avez pas encore d'artiste.",
  addArtist: "Ajouter un artiste",
  needsReleaseHint: "Cet artiste n'a encore aucune sortie livrée aux plateformes. Les demandes s'ouvrent après la première livraison.",
  services: {
    spotify: {
      name: "Spotify for Artists",
      body: "Modifiez la photo et la bio de l'artiste, proposez vos nouveaux titres et voyez qui vous écoute.",
    },
    apple_music: {
      name: "Apple Music for Artists",
      body: "Consultez écoutes, Shazams et villes de vos auditeurs, et gardez vos informations d'artiste à jour.",
    },
    youtube_oac: {
      name: "YouTube Official Artist Channel",
      body: "Réunissez musique, vidéos et abonnés sur une seule chaîne officielle avec le badge note de musique.",
    },
    tidal: {
      name: "Tidal",
      body: "Faites vérifier votre page d'artiste pour mettre à jour votre profil et suivre vos résultats.",
    },
  },
  requestAccess: "Demander l'accès",
  request: "Envoyer la demande",
  requestVerification: "Demander la vérification",
  spotifyNote: "Nous transmettons votre demande et vous recevez un e-mail dès que l'accès est prêt.",
  appleNote: "Nous transmettons votre demande et vous recevez un e-mail dès que l'accès est prêt.",
  appleNotFound: "Vous ne trouvez pas votre artiste une fois prêt ? Inscrivez-vous directement sur",
  appleLink: "artists.apple.com",
  youtubeLegend: "Quelle situation correspond à cet artiste ?",
  youtubeOptions: {
    none: { label: "Pas encore de chaîne", hint: "Nous créons la chaîne officielle à partir de la musique que vous sortez." },
    shared: {
      label: "Une chaîne partagée avec d'autres artistes",
      hint: "Par exemple une chaîne de label, de groupe ou de famille. Nous lançons la chaîne officielle à partir de votre seule musique.",
    },
    dedicated: {
      label: "Une chaîne réservée à cet artiste",
      hint: "Nous la réunissons avec votre musique en une seule chaîne officielle. Ajoutez le lien de la chaîne ci-dessous.",
    },
  },
  channelUrl: "Lien de la chaîne",
  channelUrlHint: "Par exemple https://www.youtube.com/@votrenom",
  channelUrlRequired: "Collez le lien de la chaîne de cet artiste.",
  channelUrlInvalid: "Collez un lien complet de chaîne YouTube, comme https://www.youtube.com/@votrenom",
  channelOptionRequired: "Choisissez une option.",
  tidalStepsTitle: "Avant de faire la demande",
  tidalSteps: [
    "Connectez-vous sur tidal.com, ou créez-y un compte gratuit.",
    "Vérifiez que votre musique est en ligne sur Tidal sous ce nom d'artiste.",
    "Utilisez la même adresse e-mail que votre compte 2kTunes pour que nous puissions vous associer.",
  ],
  sent: "Demande envoyée. Nous vous écrirons dès qu'il y a du nouveau.",
  alreadyOpen: "Une demande est déjà en cours pour cet artiste. Nous la mettrons à jour ici.",
  needsRelease: (artist) =>
    `${artist} doit avoir au moins une sortie livrée aux plateformes avant de faire cette demande. Sortez d'abord de la musique sous cet artiste, puis revenez.`,
  goToMusic: "Aller à ma musique",
  notAvailable: "Les demandes ne peuvent pas encore être envoyées car cette fonction est en cours d'activation. Réessayez un peu plus tard.",
  claimsTitle: (artist) => `Demandes pour ${artist}`,
  claimsEmpty: "Aucune demande pour l'instant.",
  claimsLoading: "Chargement des demandes...",
  requestedOn: (date) => `Demandé le ${date}`,
  status: {
    requested: "Demandée",
    in_progress: "En cours",
    completed: "Terminée",
    rejected: "Refusée",
  },
};

export const COPY = { EN, SW, FR };
