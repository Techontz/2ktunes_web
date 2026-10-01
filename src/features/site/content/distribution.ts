import type { Localized } from "@/lib/LanguageContext";
import type { PageCopy } from "../MarketingPage";

export const DISTRIBUTION: Localized<PageCopy> = {
  EN: {
    meta: {
      title: "Distribution",
      description: "Release your music to global streaming services, short-video apps and African platforms from one upload.",
    },
    hero: {
      eyebrow: "Distribution",
      title: "One upload. Every place people listen.",
      lede: "Send singles, EPs and albums to global streaming services, short-video apps and African platforms. We handle formats, metadata and delivery — you choose the stores and the date.",
      secondary: { label: "See pricing", to: "/pricing" },
      visual: "release",
    },
    sections: [
      {
        type: "stores",
        tone: "raised",
        eyebrow: "Destinations",
        title: "Global reach, with African platforms built in.",
        lede: "Pick destinations per release. Some stores have their own content rules and territory limits; we tell you before you submit, not after.",
      },
      {
        type: "steps",
        tone: "light",
        eyebrow: "Release flow",
        title: "A guided release, start to finish.",
        lede: "Save a draft at any point and come back to it. Nothing goes to a store until you submit and our review is complete.",
        steps: [
          { title: "Add your music", body: "Upload WAV or FLAC audio and square artwork of at least 3000 × 3000 px." },
          { title: "Tell the stores who made it", body: "Artists, featured artists, songwriters, producers, genre, language and explicit flag." },
          { title: "Choose stores & date", body: "Select destinations and a release date — earlier dates leave room for pitching." },
          { title: "We review", body: "We check audio, artwork and metadata against store rules and flag anything that would be rejected." },
          { title: "Delivered & live", body: "Your release goes out to each store, and you can track its status per destination." },
        ],
      },
      {
        type: "features",
        tone: "dark",
        eyebrow: "What's included",
        title: "Everything a release needs to land properly.",
        items: [
          { icon: "badge", title: "ISRC & UPC codes", body: "Free codes for every track and release if you don't already have your own." },
          { icon: "calendar", title: "Scheduled release dates", body: "Pick the day your music goes live, worldwide or by territory where stores allow it." },
          { icon: "file", title: "Metadata review", body: "Human review of titles, credits and artwork catches problems before a store does." },
          { icon: "layers", title: "Singles, EPs and albums", body: "Release any format, including multi-artist and compilation releases." },
          { icon: "video", title: "Short-video ready", body: "Make your sound available for creators to use in short-video content where platforms support it." },
          { icon: "shield", title: "Takedowns and edits", body: "Request metadata changes or take a release down from your dashboard at any time." },
        ],
      },
      {
        type: "notice",
        tone: "raised",
        title: "What we can promise — and what we can't",
        body: "We promise accurate delivery, clear status and honest reporting. We can't promise streams, playlist placements or editorial features, and each store makes its own decisions about what it accepts and features.",
      },
      {
        type: "faq",
        tone: "dark",
        eyebrow: "Distribution FAQ",
        title: "Before you release",
        items: [
          { q: "How early should I submit?", a: "At least two to three weeks before your release date. If you want to pitch to store editors, submit four or more weeks ahead." },
          { q: "What audio format do you need?", a: "Lossless WAV or FLAC, 16-bit/44.1 kHz or higher. MP3 files are not accepted by most stores." },
          { q: "Can I release a cover song?", a: "Yes, as long as you have the right mechanical licence for the territories you release in. We'll ask you to confirm this during upload." },
          { q: "I already released this song elsewhere. Can I move it?", a: "Yes. Use the same ISRC codes and original release date so your play counts and history carry over." },
        ],
        link: { label: "More answers in the Help Center", to: "/help" },
      },
    ],
    cta: { title: "Ready when your music is.", lede: "Create your account now and upload your first release whenever you're ready." },
  },
  SW: {
    meta: {
      title: "Usambazaji",
      description: "Toa muziki wako kwenye huduma za kimataifa, programu za video fupi na majukwaa ya Afrika kwa upakiaji mmoja.",
    },
    hero: {
      eyebrow: "Usambazaji",
      title: "Upakiaji mmoja. Kila mahali watu wanaposikiliza.",
      lede: "Tuma nyimbo, EP na albamu kwenye huduma za kimataifa, programu za video fupi na majukwaa ya Afrika. Tunashughulikia mifumo, taarifa na uwasilishaji — wewe unachagua maduka na tarehe.",
      secondary: { label: "Angalia bei", to: "/pricing" },
      visual: "release",
    },
    sections: [
      {
        type: "stores",
        tone: "raised",
        eyebrow: "Maeneo",
        title: "Kufika kimataifa, pamoja na majukwaa ya Afrika.",
        lede: "Chagua maeneo kwa kila toleo. Baadhi ya maduka yana masharti yao ya maudhui na mipaka ya nchi; tunakujulisha kabla ya kuwasilisha, si baadaye.",
      },
      {
        type: "steps",
        tone: "light",
        eyebrow: "Hatua za kutoa",
        title: "Toleo linaloongozwa, mwanzo hadi mwisho.",
        lede: "Hifadhi rasimu wakati wowote na urudi baadaye. Hakuna kinachokwenda dukani hadi uwasilishe na ukaguzi wetu ukamilike.",
        steps: [
          { title: "Weka muziki wako", body: "Pakia sauti ya WAV au FLAC na picha ya mraba ya angalau pikseli 3000 × 3000." },
          { title: "Eleza waliohusika", body: "Wasanii, walioshirikishwa, watunzi, watayarishaji, aina ya muziki, lugha na kama una maneno makali." },
          { title: "Chagua maduka na tarehe", body: "Chagua maeneo na tarehe ya kutoa — tarehe za mbali zinatoa nafasi ya kuwasilisha kwa wahariri." },
          { title: "Tunakagua", body: "Tunakagua sauti, picha na taarifa kulingana na masharti ya maduka na kukuonyesha kitakachokataliwa." },
          { title: "Imesambazwa na iko hewani", body: "Toleo lako linakwenda kila duka, na unafuatilia hali yake kwa kila eneo." },
        ],
      },
      {
        type: "features",
        tone: "dark",
        eyebrow: "Kilichomo",
        title: "Kila kitu toleo linachohitaji ili lifike vizuri.",
        items: [
          { icon: "badge", title: "Namba za ISRC na UPC", body: "Namba za bure kwa kila wimbo na toleo kama huna zako tayari." },
          { icon: "calendar", title: "Tarehe za kutoa zilizopangwa", body: "Chagua siku muziki wako unaanza kusikika, duniani kote au kwa nchi pale maduka yanaporuhusu." },
          { icon: "file", title: "Ukaguzi wa taarifa", body: "Ukaguzi wa watu halisi wa majina, wahusika na picha unagundua matatizo kabla ya duka." },
          { icon: "layers", title: "Nyimbo, EP na albamu", body: "Toa aina yoyote, zikiwemo za wasanii wengi na mkusanyiko." },
          { icon: "video", title: "Tayari kwa video fupi", body: "Ruhusu watengeneza maudhui kutumia sauti yako kwenye video fupi pale majukwaa yanaporuhusu." },
          { icon: "shield", title: "Kuondoa na kubadilisha", body: "Omba mabadiliko ya taarifa au ondoa toleo kutoka dashibodi wakati wowote." },
        ],
      },
      {
        type: "notice",
        tone: "raised",
        title: "Tunachoweza kuahidi — na tusichoweza",
        body: "Tunaahidi uwasilishaji sahihi, hali inayoonekana na ripoti za kweli. Hatuwezi kuahidi usikilizaji, kuwekwa kwenye orodha au kuchaguliwa na wahariri, na kila duka hufanya maamuzi yake kuhusu kinachokubaliwa.",
      },
      {
        type: "faq",
        tone: "dark",
        eyebrow: "Maswali ya usambazaji",
        title: "Kabla hujatoa",
        items: [
          { q: "Niwasilishe mapema kiasi gani?", a: "Angalau wiki mbili hadi tatu kabla ya tarehe ya kutoa. Kama unataka kuwasilisha kwa wahariri wa maduka, wasilisha wiki nne au zaidi kabla." },
          { q: "Mnahitaji sauti ya aina gani?", a: "WAV au FLAC isiyopunguzwa ubora, 16-bit/44.1 kHz au zaidi. Maduka mengi hayakubali MP3." },
          { q: "Naweza kutoa wimbo wa kurudia (cover)?", a: "Ndiyo, ikiwa una leseni sahihi ya haki za utunzi kwa nchi unazotoa. Tutakuomba uthibitishe wakati wa kupakia." },
          { q: "Nilishatoa wimbo huu mahali pengine. Naweza kuuhamisha?", a: "Ndiyo. Tumia namba zilezile za ISRC na tarehe ya awali ya kutoa ili idadi ya usikilizaji na historia viendelee." },
        ],
        link: { label: "Majibu zaidi kwenye Kituo cha Msaada", to: "/help" },
      },
    ],
    cta: { title: "Tuko tayari muziki wako ukiwa tayari.", lede: "Fungua akaunti sasa na upakie toleo lako la kwanza utakapokuwa tayari." },
  },
};
