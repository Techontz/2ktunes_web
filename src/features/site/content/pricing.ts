import type { Localized } from "@/lib/LanguageContext";
import type { PageCopy } from "../MarketingPage";

export const PRICING: Localized<PageCopy> = {
  EN: {
    meta: { title: "Pricing", description: "Current 2kTunes distribution plans, priced by the number of artist profiles you manage." },
    hero: {
      eyebrow: "Pricing",
      title: "Straightforward plans. Your rights on every one.",
      lede: "Plans are priced by how many artist profiles you manage. Prices below are loaded live from our plans, so what you see is what you'll pay.",
      secondary: { label: "Talk to us", to: "/contact" },
    },
    sections: [
      {
        type: "plans",
        tone: "light",
        eyebrow: "Plans",
        title: "Choose the plan that fits your roster.",
        lede: "Upgrade as your roster grows. Promotion services and creator campaigns are priced separately and always shown before you pay.",
      },
      {
        type: "features",
        tone: "dark",
        eyebrow: "On every plan",
        title: "The essentials are never an upgrade.",
        items: [
          { icon: "shield", title: "100% of your rights", body: "You own your masters and compositions. Take a release down whenever you want." },
          { icon: "globe", title: "Global & African stores", body: "Deliver to global services and African platforms from the same upload." },
          { icon: "wallet", title: "Royalty wallet", body: "Royalties stay in the currency stores pay; withdraw to mobile money or bank, converted to TZS at a rate shown before you confirm." },
          { icon: "pie", title: "Royalty splits", body: "Pay collaborators their share automatically." },
          { icon: "chart", title: "Analytics", body: "Streams, territories and earnings by release as store reports arrive." },
          { icon: "languages", title: "Bilingual support", body: "Help in English and Kiswahili from a team based in Tanzania." },
        ],
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "Pricing FAQ",
        title: "Billing questions",
        items: [
          { q: "What happens if I stop paying?", a: "Your account stays yours. Releases may be taken down from stores after your plan ends, and any earned royalties remain in your wallet to withdraw." },
          { q: "Can I pay in shillings?", a: "Plans are shown in the currency set for each plan. Where a plan is priced in another currency, your dashboard shows the TZS amount before you pay." },
          { q: "Do labels get a different plan?", a: "Larger rosters can choose a plan with more artist profiles, or contact us for a label arrangement." },
        ],
        link: { label: "For labels", to: "/labels" },
      },
    ],
    cta: { title: "Pick a plan when you're ready.", lede: "Creating an account is free. You choose a plan before your first release goes out.", secondary: { label: "Contact us", to: "/contact" } },
  },
  SW: {
    meta: { title: "Bei", description: "Vifurushi vya sasa vya usambazaji vya 2kTunes, kwa bei kulingana na idadi ya wasifu wa wasanii unaosimamia." },
    hero: {
      eyebrow: "Bei",
      title: "Vifurushi vilivyo wazi. Haki zako kwenye kila kimoja.",
      lede: "Bei za vifurushi zinategemea idadi ya wasifu wa wasanii unaosimamia. Bei zilizo hapa chini zinapakiwa moja kwa moja kutoka mfumo wetu, kwa hiyo unachoona ndicho utakacholipa.",
      secondary: { label: "Zungumza nasi", to: "/contact" },
    },
    sections: [
      {
        type: "plans",
        tone: "light",
        eyebrow: "Vifurushi",
        title: "Chagua kifurushi kinachofaa wasanii wako.",
        lede: "Panda daraja kadiri idadi ya wasanii inavyoongezeka. Huduma za utangazaji na kampeni za watengeneza maudhui zina bei tofauti na zinaonyeshwa kabla ya kulipa.",
      },
      {
        type: "features",
        tone: "dark",
        eyebrow: "Kwenye kila kifurushi",
        title: "Mambo ya msingi hayahitaji kupanda daraja.",
        items: [
          { icon: "shield", title: "Haki zako 100%", body: "Unamiliki master na utunzi wako. Ondoa toleo wakati wowote." },
          { icon: "globe", title: "Maduka ya kimataifa na Afrika", body: "Sambaza kwenye huduma za kimataifa na majukwaa ya Afrika kwa upakiaji uleule." },
          { icon: "wallet", title: "Pochi ya mirabaha", body: "Mirabaha inabaki kwa sarafu ambayo maduka hulipa; toa kwenda pesa ya simu au benki, ikibadilishwa kuwa TZS kwa kiwango kinachoonyeshwa kabla ya kuthibitisha." },
          { icon: "pie", title: "Mgawanyo wa mirabaha", body: "Walipe washirika sehemu yao moja kwa moja." },
          { icon: "chart", title: "Takwimu", body: "Usikilizaji, nchi na mapato kwa kila toleo kadiri ripoti zinavyofika." },
          { icon: "languages", title: "Msaada kwa lugha mbili", body: "Msaada kwa Kiingereza na Kiswahili kutoka timu iliyoko Tanzania." },
        ],
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "Maswali ya bei",
        title: "Maswali ya malipo",
        items: [
          { q: "Itakuwaje nikiacha kulipa?", a: "Akaunti inabaki yako. Matoleo yanaweza kuondolewa madukani kifurushi kikiisha, na mirabaha uliyopata inabaki kwenye pochi yako kutoa." },
          { q: "Naweza kulipa kwa shilingi?", a: "Vifurushi vinaonyeshwa kwa sarafu iliyowekwa kwa kila kifurushi. Kama kifurushi kina bei kwa sarafu nyingine, dashibodi inaonyesha kiasi cha TZS kabla ya kulipa." },
          { q: "Lebo zina kifurushi tofauti?", a: "Wenye wasanii wengi wanaweza kuchagua kifurushi chenye wasifu zaidi, au kuwasiliana nasi kwa mpango wa lebo." },
        ],
        link: { label: "Kwa lebo", to: "/labels" },
      },
    ],
    cta: { title: "Chagua kifurushi ukiwa tayari.", lede: "Kufungua akaunti ni bure. Unachagua kifurushi kabla toleo lako la kwanza halijatoka.", secondary: { label: "Wasiliana nasi", to: "/contact" } },
  },
  FR: {
    meta: { title: "Tarifs", description: "Offres de distribution 2kTunes actuelles, tarifées selon le nombre de profils d’artistes que vous gérez." },
    hero: {
      eyebrow: "Tarifs",
      title: "Des offres claires. Vos droits, toujours.",
      lede: "Le prix des offres dépend du nombre de profils d’artistes que vous gérez. Les prix ci-dessous sont chargés en direct depuis nos offres : ce que vous voyez est ce que vous paierez.",
      secondary: { label: "Parlez-nous", to: "/contact" },
    },
    sections: [
      {
        type: "plans",
        tone: "light",
        eyebrow: "Offres",
        title: "Choisissez l’offre adaptée à votre catalogue.",
        lede: "Passez à l’offre supérieure à mesure que votre catalogue d’artistes grandit. Les services de promotion et les campagnes de créateurs sont facturés séparément et toujours affichés avant paiement.",
      },
      {
        type: "features",
        tone: "dark",
        eyebrow: "Dans chaque offre",
        title: "L’essentiel n’est jamais en option.",
        items: [
          { icon: "shield", title: "100 % de vos droits", body: "Vos masters et vos compositions vous appartiennent. Retirez une sortie quand vous le souhaitez." },
          { icon: "globe", title: "Plateformes mondiales et africaines", body: "Distribuez sur les services mondiaux et les plateformes africaines à partir du même envoi." },
          { icon: "wallet", title: "Portefeuille de royalties", body: "Les royalties restent dans la devise versée par les plateformes ; retirez vers mobile money ou banque, avec conversion en TZS à un taux affiché avant confirmation." },
          { icon: "pie", title: "Partages de revenus", body: "Versez automatiquement leur part à vos collaborateurs." },
          { icon: "chart", title: "Statistiques", body: "Écoutes, territoires et revenus par sortie, au fil des rapports des plateformes." },
          { icon: "languages", title: "Assistance bilingue", body: "Aide en anglais et en kiswahili par une équipe basée en Tanzanie." },
        ],
      },
      {
        type: "faq",
        tone: "raised",
        eyebrow: "FAQ tarifs",
        title: "Questions de facturation",
        items: [
          { q: "Que se passe-t-il si j’arrête de payer ?", a: "Votre compte reste le vôtre. Vos sorties peuvent être retirées des plateformes à la fin de votre offre, et les royalties acquises restent dans votre portefeuille, prêtes à être retirées." },
          { q: "Puis-je payer en shillings ?", a: "Chaque offre est affichée dans la devise qui lui est attribuée. Si une offre est tarifée dans une autre devise, votre tableau de bord indique le montant en TZS avant paiement." },
          { q: "Les labels ont-ils une offre spécifique ?", a: "Les catalogues plus importants peuvent choisir une offre avec davantage de profils d’artistes, ou nous contacter pour un accord label." },
        ],
        link: { label: "Pour les labels", to: "/labels" },
      },
    ],
    cta: { title: "Choisissez une offre quand vous êtes prêt.", lede: "La création de compte est gratuite. Vous choisissez une offre avant la mise en ligne de votre première sortie.", secondary: { label: "Nous contacter", to: "/contact" } },
  },
};
