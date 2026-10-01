import type { Localized } from "@/lib/LanguageContext";

/**
 * Legal drafts. ALL OF THESE ARE DRAFTS pending review by counsel; the page
 * renders a prominent "Draft — to be reviewed by counsel" banner. Original
 * text written for 2kTunes — not adapted from any other company's terms.
 */

export type LegalDocId = "terms" | "privacy" | "distribution-agreement" | "acceptable-use";
export type LegalSection = { id: string; heading: string; body: string[] };
export type LegalDoc = { title: string; summary: string; sections: LegalSection[] };

export const LEGAL_UPDATED = "2026-10-01";

export const LEGAL: Record<LegalDocId, Localized<LegalDoc>> = {
  terms: {
    EN: {
      title: "Terms of Service",
      summary: "The rules for using the 2kTunes website, dashboard and services.",
      sections: [
        { id: "about", heading: "1. About these terms", body: ["These Terms of Service form an agreement between you and 2kTunes (“2kTunes”, “we”, “us”) for your use of our website, dashboard and related services (the “Services”). By creating an account or using the Services, you agree to these terms.", "If you distribute music through 2kTunes, the Distribution Agreement also applies. Our Privacy Policy explains how we handle personal data, and our Acceptable Use Policy sets out what is not allowed."] },
        { id: "eligibility", heading: "2. Who can use 2kTunes", body: ["You must be at least 18 years old, or the age of majority where you live, to open an account. If you act for a label, company or group, you confirm you are authorised to bind them to these terms.", "You must give accurate information when you register and keep it up to date."] },
        { id: "account", heading: "3. Your account", body: ["You are responsible for keeping your login details secure and for all activity under your account. Tell us immediately at the contact address below if you believe your account has been accessed without permission.", "We may suspend or close accounts that breach these terms, the Acceptable Use Policy or applicable law, or that put other users, stores or 2kTunes at risk."] },
        { id: "plans", heading: "4. Plans, fees and payment", body: ["Some Services require a paid plan. Prices, billing periods and what each plan includes are shown before you pay. Promotion services and campaigns are priced separately and shown before you commit.", "Unless the law says otherwise, fees already paid are not refundable for a billing period that has started. We will give reasonable notice before changing the price of a plan you are subscribed to."] },
        { id: "royalties", heading: "5. Royalties and withdrawals", body: ["Royalties are credited to your wallet after we receive and process reports and payments from stores and partners. Amounts shown before that are estimates.", "Withdrawals are subject to the minimum amount, available payout methods, fees and exchange rates shown in your dashboard at the time you request them. We may delay or withhold payments connected to suspected fraud, artificial streaming, rights disputes or legal requirements, and will tell you why where the law allows."] },
        { id: "content", heading: "6. Your content", body: ["You keep all rights in the music, artwork and other material you upload. You grant us the licences described in the Distribution Agreement so we can provide the Services.", "You must only upload content you own or are authorised to distribute."] },
        { id: "no-guarantee", heading: "7. No guaranteed results", body: ["Stores, editors, curators, creators and audiences make their own decisions. We do not guarantee any number of streams, placements, features, followers or earnings."] },
        { id: "liability", heading: "8. Liability", body: ["We provide the Services with reasonable skill and care. To the extent permitted by law, we are not liable for indirect or consequential losses, or for the acts of stores, payment providers or other third parties. Nothing in these terms limits liability that cannot be limited by law."] },
        { id: "changes", heading: "9. Changes and termination", body: ["We may update these terms. If a change is material, we will notify you before it takes effect. You may close your account at any time; some obligations, such as payment of earned royalties, continue after closure."] },
        { id: "law", heading: "10. Governing law and contact", body: ["These terms are governed by the laws of the United Republic of Tanzania. Questions about these terms can be sent to support@2ktunes.com."] },
      ],
    },
    SW: {
      title: "Masharti ya Huduma",
      summary: "Kanuni za kutumia tovuti, dashibodi na huduma za 2kTunes.",
      sections: [
        { id: "about", heading: "1. Kuhusu masharti haya", body: ["Masharti haya ya Huduma ni makubaliano kati yako na 2kTunes (“2kTunes”, “sisi”) kuhusu matumizi ya tovuti, dashibodi na huduma zinazohusiana (“Huduma”). Kwa kufungua akaunti au kutumia Huduma, unakubali masharti haya.", "Kama unasambaza muziki kupitia 2kTunes, Mkataba wa Usambazaji pia unatumika. Sera yetu ya Faragha inaeleza jinsi tunavyoshughulikia taarifa binafsi, na Sera ya Matumizi Yanayokubalika inaeleza yasiyoruhusiwa."] },
        { id: "eligibility", heading: "2. Nani anaweza kutumia 2kTunes", body: ["Lazima uwe na umri wa angalau miaka 18, au umri wa utu uzima kisheria unapoishi, kufungua akaunti. Kama unafanya kazi kwa niaba ya lebo, kampuni au kikundi, unathibitisha kuwa una mamlaka ya kuwafunga kwa masharti haya.", "Lazima utoe taarifa sahihi unapojisajili na uzisasishe."] },
        { id: "account", heading: "3. Akaunti yako", body: ["Una wajibu wa kulinda taarifa zako za kuingia na shughuli zote kwenye akaunti yako. Tujulishe mara moja kupitia anwani iliyo hapa chini ukiamini akaunti yako imeingiliwa bila ruhusa.", "Tunaweza kusimamisha au kufunga akaunti zinazokiuka masharti haya, Sera ya Matumizi Yanayokubalika au sheria, au zinazoweka watumiaji wengine, maduka au 2kTunes hatarini."] },
        { id: "plans", heading: "4. Vifurushi, ada na malipo", body: ["Baadhi ya Huduma zinahitaji kifurushi cha kulipia. Bei, vipindi vya malipo na kilichomo kwenye kila kifurushi vinaonyeshwa kabla ya kulipa. Huduma za utangazaji na kampeni zina bei tofauti na zinaonyeshwa kabla ya kukubali.", "Isipokuwa sheria inasema vinginevyo, ada iliyolipwa hairudishwi kwa kipindi cha malipo kilichoanza. Tutatoa taarifa ya kutosha kabla ya kubadilisha bei ya kifurushi ulichojiunga nacho."] },
        { id: "royalties", heading: "5. Mirabaha na utoaji wa pesa", body: ["Mirabaha inaingizwa kwenye pochi yako baada ya kupokea na kushughulikia ripoti na malipo kutoka maduka na washirika. Kiasi kinachoonyeshwa kabla ya hapo ni makadirio.", "Utoaji wa pesa unategemea kiwango cha chini, njia za malipo zinazopatikana, ada na viwango vya ubadilishaji vinavyoonyeshwa kwenye dashibodi wakati wa kuomba. Tunaweza kuchelewesha au kuzuia malipo yanayohusiana na udanganyifu unaoshukiwa, usikilizaji wa kughushi, migogoro ya haki au matakwa ya kisheria, na tutakueleza sababu pale sheria inaporuhusu."] },
        { id: "content", heading: "6. Maudhui yako", body: ["Unabaki na haki zote za muziki, picha na vitu vingine unavyopakia. Unatupa leseni zilizoelezwa kwenye Mkataba wa Usambazaji ili tuweze kutoa Huduma.", "Lazima upakie tu maudhui unayomiliki au una ruhusa ya kuyasambaza."] },
        { id: "no-guarantee", heading: "7. Hakuna matokeo yaliyohakikishwa", body: ["Maduka, wahariri, wachaguzi, watengeneza maudhui na hadhira hufanya maamuzi yao wenyewe. Hatuhakikishi idadi yoyote ya usikilizaji, nafasi, kuchaguliwa, wafuasi au mapato."] },
        { id: "liability", heading: "8. Dhima", body: ["Tunatoa Huduma kwa ujuzi na uangalifu unaostahili. Kwa kiwango kinachoruhusiwa na sheria, hatuwajibiki kwa hasara zisizo za moja kwa moja, au kwa matendo ya maduka, watoa huduma za malipo au wahusika wengine. Hakuna kitu katika masharti haya kinachopunguza dhima isiyoweza kupunguzwa kisheria."] },
        { id: "changes", heading: "9. Mabadiliko na kusitisha", body: ["Tunaweza kusasisha masharti haya. Kama badiliko ni kubwa, tutakujulisha kabla halijaanza kutumika. Unaweza kufunga akaunti wakati wowote; baadhi ya wajibu, kama kulipa mirabaha iliyopatikana, unaendelea baada ya kufunga."] },
        { id: "law", heading: "10. Sheria inayotumika na mawasiliano", body: ["Masharti haya yanaongozwa na sheria za Jamhuri ya Muungano wa Tanzania. Maswali kuhusu masharti haya yatumwe kwa support@2ktunes.com."] },
      ],
    },
  },
  privacy: {
    EN: {
      title: "Privacy Policy",
      summary: "What personal data we collect, why, and the choices you have.",
      sections: [
        { id: "who", heading: "1. Who we are", body: ["2kTunes is responsible for the personal data described in this policy. We handle personal data in line with the Personal Data Protection Act, 2022 of Tanzania and other laws that apply to you."] },
        { id: "collect", heading: "2. What we collect", body: ["Account data: name, email, password (stored only as a secure hash), account type and profile details you add.", "Release data: music, artwork, credits and metadata, including names of collaborators you add.", "Payout data: mobile money numbers, bank details and tax information you provide for withdrawals.", "Usage data: log and device information, and approximate location derived from IP address, used to secure and improve the Services."] },
        { id: "use", heading: "3. How we use it", body: ["To provide the Services: delivering releases, calculating and paying royalties, running campaigns you request and supporting you.", "To keep the platform safe: preventing fraud, artificial streaming and unauthorised access.", "To meet legal obligations such as tax and anti-money-laundering requirements.", "To send service messages. Marketing messages are optional and you can opt out at any time."] },
        { id: "share", heading: "4. Who we share it with", body: ["Stores and distribution partners receive release metadata, including artist and contributor names, so your music can be delivered.", "Payment providers receive the details needed to process your withdrawals.", "Service providers (hosting, email, analytics) process data on our instructions.", "Authorities, where the law requires. We do not sell your personal data."] },
        { id: "transfers", heading: "5. International transfers", body: ["Some partners and providers are located outside Tanzania. Where data is transferred, we use appropriate safeguards required by law."] },
        { id: "retention", heading: "6. How long we keep it", body: ["We keep account data while your account is open. Financial records are kept for as long as tax and accounting law requires, even after you close your account."] },
        { id: "rights", heading: "7. Your rights", body: ["You can ask to access, correct or delete your personal data, object to certain uses, or withdraw consent where we rely on it. Contact support@2ktunes.com. You may also complain to the Personal Data Protection Commission of Tanzania."] },
        { id: "security", heading: "8. Security", body: ["We use technical and organisational measures to protect your data, including encryption in transit and hashed passwords. No system is perfectly secure; tell us promptly if you suspect a problem."] },
      ],
    },
    SW: {
      title: "Sera ya Faragha",
      summary: "Taarifa binafsi tunazokusanya, kwa nini, na chaguo ulizonazo.",
      sections: [
        { id: "who", heading: "1. Sisi ni nani", body: ["2kTunes inawajibika kwa taarifa binafsi zilizoelezwa kwenye sera hii. Tunashughulikia taarifa binafsi kwa mujibu wa Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania, 2022 na sheria nyingine zinazokuhusu."] },
        { id: "collect", heading: "2. Tunachokusanya", body: ["Taarifa za akaunti: jina, barua pepe, nenosiri (linahifadhiwa kama hash salama tu), aina ya akaunti na taarifa za wasifu unazoongeza.", "Taarifa za matoleo: muziki, picha, wahusika na taarifa za wimbo, yakiwemo majina ya washirika unaowaongeza.", "Taarifa za malipo: namba za pesa ya simu, taarifa za benki na kodi unazotoa kwa ajili ya kutoa pesa.", "Taarifa za matumizi: kumbukumbu na taarifa za kifaa, na eneo la takriban kutokana na anwani ya IP, kwa ajili ya usalama na kuboresha Huduma."] },
        { id: "use", heading: "3. Tunavyozitumia", body: ["Kutoa Huduma: kusambaza matoleo, kukokotoa na kulipa mirabaha, kuendesha kampeni unazoomba na kukusaidia.", "Kulinda jukwaa: kuzuia udanganyifu, usikilizaji wa kughushi na kuingia bila ruhusa.", "Kutimiza wajibu wa kisheria kama kodi na kuzuia utakatishaji fedha.", "Kutuma ujumbe wa huduma. Ujumbe wa matangazo ni wa hiari na unaweza kujiondoa wakati wowote."] },
        { id: "share", heading: "4. Tunashirikisha na nani", body: ["Maduka na washirika wa usambazaji hupokea taarifa za toleo, yakiwemo majina ya wasanii na wachangiaji, ili muziki wako usambazwe.", "Watoa huduma za malipo hupokea taarifa zinazohitajika kushughulikia utoaji wa pesa.", "Watoa huduma (hifadhi, barua pepe, takwimu) hushughulikia taarifa kwa maelekezo yetu.", "Mamlaka, pale sheria inapotaka. Hatuuzi taarifa zako binafsi."] },
        { id: "transfers", heading: "5. Uhamisho nje ya nchi", body: ["Baadhi ya washirika na watoa huduma wako nje ya Tanzania. Taarifa zinapohamishwa, tunatumia kinga zinazotakiwa na sheria."] },
        { id: "retention", heading: "6. Tunazihifadhi kwa muda gani", body: ["Tunahifadhi taarifa za akaunti wakati akaunti yako iko wazi. Kumbukumbu za fedha zinahifadhiwa kwa muda unaotakiwa na sheria za kodi na uhasibu, hata baada ya kufunga akaunti."] },
        { id: "rights", heading: "7. Haki zako", body: ["Unaweza kuomba kuona, kusahihisha au kufuta taarifa zako binafsi, kupinga matumizi fulani, au kuondoa ridhaa pale tunapoitegemea. Wasiliana na support@2ktunes.com. Unaweza pia kuwasilisha malalamiko kwa Tume ya Ulinzi wa Taarifa Binafsi ya Tanzania."] },
        { id: "security", heading: "8. Usalama", body: ["Tunatumia hatua za kiufundi na za kiutawala kulinda taarifa zako, ikiwemo usimbaji fiche wakati wa kusafirisha na manenosiri yaliyohashiwa. Hakuna mfumo ulio salama kikamilifu; tujulishe haraka ukishuku tatizo."] },
      ],
    },
  },
  "distribution-agreement": {
    EN: {
      title: "Distribution Agreement",
      summary: "The licence you give 2kTunes to deliver your music, and what each side is responsible for.",
      sections: [
        { id: "scope", heading: "1. Scope", body: ["This agreement applies whenever you submit a release to 2kTunes for distribution. It supplements the Terms of Service."] },
        { id: "licence", heading: "2. Licence you grant", body: ["You grant 2kTunes a non-exclusive, worldwide licence, for the territories and stores you select, to reproduce, deliver, distribute, make available and promote your releases through stores and distribution partners, and to collect income from them on your behalf.", "You keep ownership of your masters and compositions. 2kTunes acquires no ownership rights in your music."] },
        { id: "warranties", heading: "3. Your promises", body: ["You confirm that you own or control all rights needed for each release — including master, composition, samples, artwork and performer consents — and that distributing it will not infringe anyone's rights.", "You confirm that the metadata you provide is accurate."] },
        { id: "our-duties", heading: "4. What we do", body: ["We review releases for store compliance, deliver them to selected destinations through our distribution partners, report earnings to you, and pay your share as described in your plan and dashboard.", "Stores decide independently whether to accept, feature or remove content."] },
        { id: "revenue", heading: "5. Earnings and splits", body: ["Your share of income, and any commission or fee, is shown in your plan and dashboard. Where you set royalty splits, you instruct us to pay each collaborator their share, and you confirm the split reflects your agreements with them."] },
        { id: "takedowns", heading: "6. Takedowns", body: ["You can request a takedown at any time. We may remove releases that breach this agreement, receive a valid rights claim, or show signs of artificial streaming. Stores' own removal timelines apply."] },
        { id: "claims", heading: "7. Rights claims", body: ["If a third party claims rights in your release, we may pause distribution and hold related earnings until the claim is resolved. You agree to cooperate and to cover losses caused by a breach of your promises."] },
        { id: "term", heading: "8. Term and ending", body: ["This agreement continues for each release until it is taken down from all stores. Earned royalties remain payable after termination, subject to any hold under section 7."] },
      ],
    },
    SW: {
      title: "Mkataba wa Usambazaji",
      summary: "Leseni unayoipa 2kTunes kusambaza muziki wako, na wajibu wa kila upande.",
      sections: [
        { id: "scope", heading: "1. Wigo", body: ["Mkataba huu unatumika kila unapowasilisha toleo kwa 2kTunes kwa ajili ya usambazaji. Unaongeza juu ya Masharti ya Huduma."] },
        { id: "licence", heading: "2. Leseni unayotoa", body: ["Unaipa 2kTunes leseni isiyo ya upekee, ya dunia nzima, kwa nchi na maduka unayochagua, kunakili, kuwasilisha, kusambaza, kupatikana na kutangaza matoleo yako kupitia maduka na washirika wa usambazaji, na kukusanya mapato kutoka kwao kwa niaba yako.", "Unabaki na umiliki wa master na utunzi wako. 2kTunes haipati haki yoyote ya umiliki wa muziki wako."] },
        { id: "warranties", heading: "3. Ahadi zako", body: ["Unathibitisha kuwa unamiliki au kudhibiti haki zote zinazohitajika kwa kila toleo — ikiwemo master, utunzi, sampuli, picha na ridhaa za waimbaji — na kwamba kulisambaza hakutakiuka haki za mtu yeyote.", "Unathibitisha kuwa taarifa unazotoa ni sahihi."] },
        { id: "our-duties", heading: "4. Tunachofanya", body: ["Tunakagua matoleo kulingana na masharti ya maduka, tunayasambaza kwenye maeneo yaliyochaguliwa kupitia washirika wetu, tunakuripotia mapato, na tunalipa sehemu yako kama ilivyoelezwa kwenye kifurushi na dashibodi.", "Maduka huamua yenyewe kama yatakubali, kuchagua au kuondoa maudhui."] },
        { id: "revenue", heading: "5. Mapato na mgawanyo", body: ["Sehemu yako ya mapato, na kamisheni au ada yoyote, inaonyeshwa kwenye kifurushi na dashibodi. Unapoweka mgawanyo wa mirabaha, unatuelekeza kumlipa kila mshirika sehemu yake, na unathibitisha kuwa mgawanyo unaendana na makubaliano yenu."] },
        { id: "takedowns", heading: "6. Kuondoa matoleo", body: ["Unaweza kuomba toleo liondolewe wakati wowote. Tunaweza kuondoa matoleo yanayokiuka mkataba huu, yanayopata dai halali la haki, au yanayoonyesha dalili za usikilizaji wa kughushi. Ratiba za maduka za kuondoa zinatumika."] },
        { id: "claims", heading: "7. Madai ya haki", body: ["Mtu mwingine akidai haki kwenye toleo lako, tunaweza kusimamisha usambazaji na kushikilia mapato yanayohusika hadi dai litatuliwe. Unakubali kushirikiana na kufidia hasara zinazotokana na kuvunja ahadi zako."] },
        { id: "term", heading: "8. Muda na kumalizika", body: ["Mkataba huu unaendelea kwa kila toleo hadi liondolewe kwenye maduka yote. Mirabaha iliyopatikana inaendelea kulipwa baada ya kumalizika, kwa kuzingatia ushikiliaji wowote chini ya kifungu cha 7."] },
      ],
    },
  },
  "acceptable-use": {
    EN: {
      title: "Acceptable Use Policy",
      summary: "What you may not do with 2kTunes, so the platform stays trusted by stores, artists and fans.",
      sections: [
        { id: "streams", heading: "1. No artificial streaming", body: ["Do not use or buy bots, stream farms, paid playlist placements that guarantee plays, or any other means of inflating streams, followers or engagement. Releases involved may be removed and related earnings withheld."] },
        { id: "rights", heading: "2. Only content you have rights to", body: ["Do not upload music, samples, beats or artwork you don't own or have permission to use. Do not impersonate other artists or use misleading artist names or titles."] },
        { id: "content", heading: "3. Prohibited content", body: ["Do not distribute content that is illegal, promotes violence or hatred, sexually exploits minors, or violates store content policies. Explicit content must be marked as explicit."] },
        { id: "campaigns", heading: "4. Honest campaigns", body: ["Creators must disclose paid promotion using platform tools and follow advertising rules. Artists must not ask creators to hide that a post is paid. Campaign briefs may not require deceptive or harmful content."] },
        { id: "spam", heading: "5. No spam or low-quality mass uploads", body: ["Do not upload duplicate releases, keyword-stuffed titles, or large volumes of low-effort audio intended to game store algorithms."] },
        { id: "security", heading: "6. Platform security", body: ["Do not attempt to access other accounts, probe or disrupt our systems, or scrape data without permission."] },
        { id: "enforcement", heading: "7. Enforcement", body: ["We may warn, restrict features, remove releases, withhold affected earnings or close accounts that breach this policy, depending on severity. Report concerns to support@2ktunes.com."] },
      ],
    },
    SW: {
      title: "Sera ya Matumizi Yanayokubalika",
      summary: "Usichoruhusiwa kufanya na 2kTunes, ili jukwaa liendelee kuaminiwa na maduka, wasanii na mashabiki.",
      sections: [
        { id: "streams", heading: "1. Hakuna usikilizaji wa kughushi", body: ["Usitumie wala kununua roboti, mashamba ya usikilizaji, nafasi za kulipia kwenye orodha zinazohakikisha usikilizaji, au njia nyingine yoyote ya kuongeza usikilizaji, wafuasi au mwitikio kwa udanganyifu. Matoleo yanayohusika yanaweza kuondolewa na mapato yake kuzuiliwa."] },
        { id: "rights", heading: "2. Maudhui unayoyamiliki tu", body: ["Usipakie muziki, sampuli, midundo au picha usiyomiliki au huna ruhusa kuitumia. Usijifanye msanii mwingine wala kutumia majina ya wasanii au nyimbo yanayopotosha."] },
        { id: "content", heading: "3. Maudhui yaliyokatazwa", body: ["Usisambaze maudhui yaliyo kinyume cha sheria, yanayochochea vurugu au chuki, yanayowanyanyasa watoto kingono, au yanayokiuka sera za maduka. Maudhui yenye maneno makali lazima yawekewe alama hiyo."] },
        { id: "campaigns", heading: "4. Kampeni za uaminifu", body: ["Watengeneza maudhui lazima waonyeshe matangazo ya kulipia kwa kutumia zana za jukwaa na kufuata sheria za matangazo. Wasanii hawaruhusiwi kuwaomba watengeneza maudhui kuficha kuwa chapisho limelipiwa. Maelekezo ya kampeni hayawezi kudai maudhui ya udanganyifu au yenye madhara."] },
        { id: "spam", heading: "5. Hakuna upakiaji wa taka", body: ["Usipakie matoleo yanayojirudia, majina yaliyojazwa maneno ya kutafutia, au sauti nyingi za ubora wa chini zinazolenga kudanganya mifumo ya maduka."] },
        { id: "security", heading: "6. Usalama wa jukwaa", body: ["Usijaribu kuingia kwenye akaunti za wengine, kuchunguza au kuvuruga mifumo yetu, au kuchota taarifa bila ruhusa."] },
        { id: "enforcement", heading: "7. Utekelezaji", body: ["Tunaweza kuonya, kuzuia huduma fulani, kuondoa matoleo, kuzuia mapato yanayohusika au kufunga akaunti zinazokiuka sera hii, kulingana na uzito wa kosa. Ripoti wasiwasi kwa support@2ktunes.com."] },
      ],
    },
  },
};
