import type { Localized } from "@/lib/LanguageContext";

/** Labels inside the product illustrations. Figures are sample data. */
type MockCopy = {
  sample: string;
  release: {
    kind: string;
    steps: [string, string, string, string];
    statusLive: string;
    destinations: string;
    more: string;
  };
  wallet: {
    title: string;
    available: string;
    lines: [string, string, string];
    withdrawTo: string;
    methods: [string, string, string, string];
    methodNote: [string, string, string, string];
    action: string;
  };
  splits: {
    title: string;
    roles: [string, string, string];
    note: string;
  };
  campaign: {
    title: string;
    status: string;
    creators: string;
    videos: string;
    budget: string;
    brief: string;
  };
  analytics: {
    title: string;
    period: string;
    territories: string;
  };
};

export const MOCKS: Localized<MockCopy> = {
  EN: {
    sample: "Illustration · sample data",
    release: {
      kind: "Single · BLESSINGS EP",
      steps: ["Uploaded", "Reviewed", "Delivered", "Live"],
      statusLive: "Live",
      destinations: "Delivered to",
      more: "more",
    },
    wallet: {
      title: "Royalty wallet",
      available: "Available to withdraw",
      lines: ["Streaming", "Short video", "Downloads"],
      withdrawTo: "Withdraw to",
      methods: ["M-Pesa", "Airtel Money", "Mixx by Yas", "Bank transfer"],
      methodNote: ["•••• 4821", "Mobile money", "Mobile money", "CRDB · NMB · others"],
      action: "Withdraw",
    },
    splits: {
      title: "Royalty split · meant2 be",
      roles: ["Primary artist", "Producer", "Songwriter"],
      note: "Each collaborator is paid their share automatically.",
    },
    campaign: {
      title: "Creator campaign",
      status: "Active",
      creators: "Creators",
      videos: "Videos",
      budget: "Budget used",
      brief: "Dance challenge · Tanzania & Kenya",
    },
    analytics: {
      title: "Streams",
      period: "Last 12 weeks",
      territories: "Top territories",
    },
  },
  SW: {
    sample: "Mfano · takwimu za kuonyesha",
    release: {
      kind: "Wimbo mmoja · BLESSINGS EP",
      steps: ["Umepakiwa", "Umekaguliwa", "Umesambazwa", "Hewani"],
      statusLive: "Hewani",
      destinations: "Umesambazwa kwenda",
      more: "zaidi",
    },
    wallet: {
      title: "Pochi ya mirabaha",
      available: "Kiasi unachoweza kutoa",
      lines: ["Usikilizaji", "Video fupi", "Upakuaji"],
      withdrawTo: "Toa kwenda",
      methods: ["M-Pesa", "Airtel Money", "Mixx by Yas", "Benki"],
      methodNote: ["•••• 4821", "Pesa ya simu", "Pesa ya simu", "CRDB · NMB · mengineyo"],
      action: "Toa pesa",
    },
    splits: {
      title: "Mgawanyo wa mirabaha · meant2 be",
      roles: ["Msanii mkuu", "Mtayarishaji", "Mtunzi"],
      note: "Kila mshirika analipwa sehemu yake moja kwa moja.",
    },
    campaign: {
      title: "Kampeni ya watengeneza maudhui",
      status: "Inaendelea",
      creators: "Washiriki",
      videos: "Video",
      budget: "Bajeti",
      brief: "Changamoto ya kucheza · Tanzania na Kenya",
    },
    analytics: {
      title: "Usikilizaji",
      period: "Wiki 12 zilizopita",
      territories: "Nchi zinazoongoza",
    },
  },
  FR: {
    sample: "Illustration · données fictives",
    release: {
      kind: "Single · BLESSINGS EP",
      steps: ["Importé", "Vérifié", "Livré", "En ligne"],
      statusLive: "En ligne",
      destinations: "Livré sur",
      more: "autres",
    },
    wallet: {
      title: "Portefeuille royalties",
      available: "Disponible au retrait",
      lines: ["Streaming", "Vidéo courte", "Téléchargements"],
      withdrawTo: "Retirer vers",
      methods: ["M-Pesa", "Airtel Money", "Mixx by Yas", "Virement"],
      methodNote: ["•••• 4821", "Mobile money", "Mobile money", "CRDB · NMB · autres"],
      action: "Retirer",
    },
    splits: {
      title: "Partage · meant2 be",
      roles: ["Artiste principal", "Producteur", "Auteur"],
      note: "Chaque collaborateur reçoit sa part automatiquement.",
    },
    campaign: {
      title: "Campagne créateurs",
      status: "Active",
      creators: "Créateurs",
      videos: "Vidéos",
      budget: "Budget utilisé",
      brief: "Défi danse · Tanzanie et Kenya",
    },
    analytics: {
      title: "Streams",
      period: "12 dernières semaines",
      territories: "Top territoires",
    },
  },
};
