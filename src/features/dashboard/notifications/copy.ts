/** Copy for /dashboard/notifications. */

const EN = {
  title: "Notifications",
  description: "Updates about your releases, money, orders and support tickets.",
  unreadCount: (n: number) => (n === 1 ? "1 unread" : `${n} unread`),
  markAll: "Mark all as read",
  markedAll: "All notifications marked as read",
  markRead: "Mark as read",
  unread: "Unread",
  open: "Open",
  emptyTitle: "No notifications yet",
  emptyBody: "When something happens with your releases, earnings or orders, you'll see it here.",
  listLabel: "Notifications",

  prefsTitle: "Notification preferences",
  prefsDescription: "Choose how we reach you for each kind of update.",
  inApp: "In-app",
  email: "Email",
  savePrefs: "Save preferences",
  prefsSaved: "Preferences saved",
  categories: {
    releases: "Releases",
    royalties: "Royalties & splits",
    payouts: "Withdrawals & payouts",
    marketplace: "Marketplace & campaigns",
    support: "Support tickets",
    product_updates: "Product news",
  } as Record<string, string>,
  categoryHints: {
    releases: "Review results, delivery and when your music goes live.",
    royalties: "New statements, split invitations and changes.",
    payouts: "Withdrawal requests, approvals and payments.",
    marketplace: "Orders, deliveries and messages from creators.",
    support: "Replies to your support tickets.",
    product_updates: "New features and occasional tips.",
  } as Record<string, string>,
};

const SW: typeof EN = {
  title: "Taarifa",
  description: "Habari kuhusu kazi zako, fedha, oda na tiketi za msaada.",
  unreadCount: (n) => (n === 1 ? "1 haijasomwa" : `${n} hazijasomwa`),
  markAll: "Weka zote kuwa zimesomwa",
  markedAll: "Taarifa zote zimewekwa kuwa zimesomwa",
  markRead: "Weka kuwa imesomwa",
  unread: "Haijasomwa",
  open: "Fungua",
  emptyTitle: "Bado hakuna taarifa",
  emptyBody: "Jambo lolote likitokea kwenye kazi zako, mapato au oda, utaliona hapa.",
  listLabel: "Taarifa",

  prefsTitle: "Mapendeleo ya taarifa",
  prefsDescription: "Chagua jinsi tunavyokufikia kwa kila aina ya habari.",
  inApp: "Ndani ya programu",
  email: "Barua pepe",
  savePrefs: "Hifadhi mapendeleo",
  prefsSaved: "Mapendeleo yamehifadhiwa",
  categories: {
    releases: "Kazi",
    royalties: "Mirabaha na migawanyo",
    payouts: "Utoaji wa fedha na malipo",
    marketplace: "Soko na kampeni",
    support: "Tiketi za msaada",
    product_updates: "Habari za huduma",
  },
  categoryHints: {
    releases: "Matokeo ya ukaguzi, usambazaji na muziki wako unapoingia hewani.",
    royalties: "Taarifa mpya za mapato, mialiko ya migawanyo na mabadiliko.",
    payouts: "Maombi ya kutoa fedha, idhini na malipo.",
    marketplace: "Oda, kazi zilizowasilishwa na ujumbe kutoka kwa watayarishaji maudhui.",
    support: "Majibu ya tiketi zako za msaada.",
    product_updates: "Huduma mpya na vidokezo vya mara kwa mara.",
  },
};

export const COPY = { EN, SW };
