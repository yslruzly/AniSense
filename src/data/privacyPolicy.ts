// ─── Privacy policy ───────────────────────────────────────────────────────────
// The one copy of the policy. The app shows it (Profile, in the settings
// card, and from the welcome screen), and `node scripts/build-privacy.mjs` writes the web page Google
// Play links to (docs/privacy-policy.html) from this same file, so the two
// can never say different things.
//
// DRAFT: written from what the app actually collects and who can see it, but
// not yet reviewed by a lawyer or a data protection officer. Have it checked
// before the Play Store release. If the app starts collecting something new,
// or the hosting region changes, this file changes with it, and so does
// `effective`.
//
// Written in plain words on purpose: the Data Privacy Act asks for language
// the people it protects can understand, and the people here are farmers.

export type Bi = { en: string; tl: string };
export type PrivacyBlock =
  | { p: Bi }
  | { list: { en: string[]; tl: string[] } };
export interface PrivacySection { id: string; title: Bi; body: PrivacyBlock[] }

export const PRIVACY = {
  /** ISO date this version took effect. */
  effective: "2026-10-01",
  operator: "Ruzly Macatula",
  place: "Manila, Philippines",
  email: "AniSense2026@gmail.com",
  title: { en: "Privacy Policy", tl: "Patakaran sa Privacy" } as Bi,
  effectiveLabel: { en: "In effect from {date}", tl: "May bisa mula {date}" } as Bi,

  sections: [
    {
      id: "short",
      title: { en: "The short version", tl: "Sa madaling salita" },
      body: [
        { list: {
          en: [
            "We collect only what the app needs: your name, how to reach you, where you are, and what you sell, buy and record.",
            "We do not sell your information, and there are no ads.",
            "We do not track your location with GPS. Your town is whatever you pick from the list.",
            "Your expenses and farm records are private. Only you can see them.",
            "You can delete your account and your data at any time.",
          ],
          tl: [
            "Kinukuha lang namin ang kailangan ng app: pangalan mo, paano ka makokontak, nasaan ka, at ang ibinebenta, binibili at itinatala mo.",
            "Hindi namin ibinebenta ang impormasyon mo, at walang ads.",
            "Hindi namin sinusundan ang lokasyon mo gamit ang GPS. Ang bayan mo ay kung ano ang pinili mo sa listahan.",
            "Pribado ang mga gastos at tala ng bukid mo. Ikaw lang ang nakakakita.",
            "Puwede mong burahin ang account at datos mo anumang oras.",
          ],
        } },
      ],
    },
    {
      id: "who",
      title: { en: "Who we are", tl: "Sino kami" },
      body: [
        { p: {
          en: "AniSense is a mobile app for farmers in Nueva Ecija and for buyers anywhere in the Philippines. It is run by {operator}, based in {place}, who is responsible for the information described here. To reach us about your privacy, write to {email}.",
          tl: "Ang AniSense ay isang mobile app para sa mga magsasaka sa Nueva Ecija at sa mga mamimili saanman sa Pilipinas. Pinapatakbo ito ni {operator}, na nasa {place}, at siya ang may pananagutan sa impormasyong inilalarawan dito. Para sa mga tanong tungkol sa privacy mo, sumulat sa {email}.",
        } },
        { p: {
          en: "This policy follows the Data Privacy Act of 2012 (Republic Act No. 10173).",
          tl: "Sumusunod ang patakarang ito sa Data Privacy Act of 2012 (Republic Act No. 10173).",
        } },
      ],
    },
    {
      id: "collect",
      title: { en: "What we collect", tl: "Ano ang kinukuha namin" },
      body: [
        { p: { en: "What you give us when you create an account:", tl: "Ang ibinibigay mo kapag gumawa ka ng account:" } },
        { list: {
          en: [
            "Your full name, and whether you are a farmer or a buyer.",
            "Your mobile number or your Gmail address, and a password. The password is stored scrambled; nobody at AniSense can read it.",
            "Where you are: for a farmer, the barangay and town of the farm; for a buyer, the province and city or town, and the barangay if you choose to give it.",
            "For farmers: how many years you have farmed, the crops you grow, and the number buyers can call.",
          ],
          tl: [
            "Ang buong pangalan mo, at kung magsasaka ka o mamimili.",
            "Ang mobile number o Gmail address mo, at isang password. Naka-encrypt ang password; walang sinuman sa AniSense ang makakabasa nito.",
            "Kung nasaan ka: para sa magsasaka, ang barangay at bayan ng bukid; para sa mamimili, ang probinsya at lungsod o bayan, at ang barangay kung gusto mong ibigay.",
            "Para sa magsasaka: ilang taon ka nang nagsasaka, ang mga tanim mo, at ang numerong puwedeng tawagan ng mamimili.",
          ],
        } },
        { p: { en: "What is created as you use the app:", tl: "Ang nabubuo habang ginagamit mo ang app:" } },
        { list: {
          en: [
            "Listings you post: the crop, description, price, quantity, place and photo.",
            "Orders: what was bought, how much, at what price, and between which buyer and farmer.",
            "A farmer's own records: expenses, sales, plantings, price alerts and expected harvests.",
            "Badges you have earned.",
          ],
          tl: [
            "Mga panindang ipino-post mo: ang tanim, paglalarawan, presyo, dami, lugar at litrato.",
            "Mga order: ano ang binili, gaano karami, magkano, at sino ang mamimili at magsasaka.",
            "Sariling tala ng magsasaka: gastos, benta, tanim, price alert at inaasahang ani.",
            "Mga badge na nakuha mo.",
          ],
        } },
        { p: { en: "What stays on your phone and is not sent to us:", tl: "Ang nananatili sa phone mo at hindi ipinapadala sa amin:" } },
        { list: {
          en: [
            "A photo you add to your member ID.",
            "Your language choice, and a saved copy of prices and your records so the app works without signal.",
          ],
          tl: [
            "Ang litratong inilagay mo sa member ID mo.",
            "Ang piniling wika, at naka-save na kopya ng mga presyo at tala mo para gumana ang app kahit walang signal.",
          ],
        } },
        { p: { en: "What we do not collect:", tl: "Ang hindi namin kinukuha:" } },
        { list: {
          en: [
            "Your GPS location, your contacts, your text messages or your call history.",
            "Payment details. No payment is made in the app; the buyer and the farmer arrange it themselves.",
            "Advertising or tracking identifiers. The app has no ads and no analytics trackers.",
          ],
          tl: [
            "Ang GPS location, contacts, text messages o call history mo.",
            "Detalye ng bayad. Walang bayarang nangyayari sa app; ang mamimili at magsasaka ang nag-uusap tungkol dito.",
            "Mga identifier para sa ads o tracking. Walang ads at walang analytics tracker ang app.",
          ],
        } },
      ],
    },
    {
      id: "why",
      title: { en: "Why we use it", tl: "Bakit namin ito ginagamit" },
      body: [
        { list: {
          en: [
            "To create your account and sign you in.",
            "To show your harvests to buyers, and to let a buyer and a farmer reach each other about an order.",
            "To keep your expenses, sales and farm records and work out your profit.",
            "To show prices, forecasts and weather for the crops and the place you chose.",
            "To keep the app safe: to stop misuse and to fix problems.",
          ],
          tl: [
            "Para gumawa ng account mo at makapag-sign in ka.",
            "Para ipakita ang ani mo sa mga mamimili, at para makapag-usap ang mamimili at magsasaka tungkol sa order.",
            "Para itago ang mga gastos, benta at tala ng bukid mo at kuwentahin ang kita mo.",
            "Para ipakita ang presyo, taya at panahon para sa mga tanim at lugar na pinili mo.",
            "Para panatilihing ligtas ang app: pigilan ang maling paggamit at ayusin ang mga problema.",
          ],
        } },
        { p: {
          en: "We use your information because you agreed to it when you created your account, and because the app cannot provide these services without it. We do not use it for anything else.",
          tl: "Ginagamit namin ang impormasyon mo dahil pumayag ka nang gumawa ka ng account, at dahil hindi maibibigay ng app ang mga serbisyong ito kung wala ito. Hindi namin ito ginagamit sa iba pang bagay.",
        } },
      ],
    },
    {
      id: "see",
      title: { en: "Who can see it", tl: "Sino ang nakakakita nito" },
      body: [
        { p: { en: "Other people using AniSense:", tl: "Ibang gumagamit ng AniSense:" } },
        { list: {
          en: [
            "A farmer's name, town, years of farming, crops, rating, phone number and listings can be seen by anyone signed in. That is how buyers find and call farmers.",
            "A buyer's name, phone number and location can be seen only by farmers that buyer has ordered from.",
            "Expenses, sales records, plantings, price alerts and expected harvests can be seen only by the farmer who wrote them.",
            "Nobody can see anything without signing in. A listing photo, though, is stored at a web address that anyone who has the link can open.",
          ],
          tl: [
            "Ang pangalan, bayan, taon ng pagsasaka, tanim, rating, numero at paninda ng magsasaka ay nakikita ng sinumang naka-sign in. Ganito nahahanap at natatawagan ng mamimili ang magsasaka.",
            "Ang pangalan, numero at lokasyon ng mamimili ay nakikita lang ng mga magsasakang inorderan niya.",
            "Ang gastos, tala ng benta, tanim, price alert at inaasahang ani ay nakikita lang ng magsasakang sumulat nito.",
            "Walang makakakita ng kahit ano nang hindi naka-sign in. Pero ang litrato ng paninda ay nasa web address na mabubuksan ng sinumang may link.",
          ],
        } },
        { p: { en: "Companies that help us run the app, and only for that purpose:", tl: "Mga kumpanyang tumutulong magpatakbo ng app, at para doon lamang:" } },
        { list: {
          en: [
            "Supabase, which hosts the database, the sign-in and the photos.",
            "Semaphore, our SMS provider in the Philippines: when phone verification is on, your mobile number is sent to it only to deliver your code.",
            "Google Fonts, which supplies the app's typefaces. Like any internet request, this shows Google your phone's internet address.",
          ],
          tl: [
            "Supabase, na nagho-host ng database, sign-in at mga litrato.",
            "Semaphore, ang SMS provider namin sa Pilipinas: kapag bukas ang phone verification, ipinapadala rito ang mobile number mo para lang maihatid ang code mo.",
            "Google Fonts, na pinagkukunan ng mga font ng app. Gaya ng anumang internet request, nakikita ng Google ang internet address ng phone mo.",
          ],
        } },
        { p: {
          en: "We do not sell or rent your information to anyone. We share it with the authorities only when the law requires it.",
          tl: "Hindi namin ibinebenta o pinapaupahan ang impormasyon mo kaninuman. Ibinabahagi lang namin ito sa awtoridad kapag iniuutos ng batas.",
        } },
      ],
    },
    {
      id: "where",
      title: { en: "Where it is kept, and how it is protected", tl: "Saan ito nakatago, at paano ito pinoprotektahan" },
      body: [
        { p: {
          en: "Your information is stored on Supabase's servers in Singapore, which is outside the Philippines.",
          tl: "Nakatago ang impormasyon mo sa mga server ng Supabase sa Singapore, na nasa labas ng Pilipinas.",
        } },
        { list: {
          en: [
            "Everything travels between your phone and the servers encrypted.",
            "The database itself enforces who can see what, so the rules above hold even if the app is tampered with.",
            "Passwords are stored scrambled and cannot be read back.",
          ],
          tl: [
            "Naka-encrypt ang lahat ng dumadaan sa pagitan ng phone mo at ng mga server.",
            "Ang database mismo ang nagpapatupad kung sino ang makakakita ng ano, kaya nananatili ang mga patakaran sa itaas kahit pakialaman ang app.",
            "Naka-encrypt ang mga password at hindi na mababasa pabalik.",
          ],
        } },
        { p: {
          en: "No system is perfectly safe. If a breach ever puts your information at risk, we will tell you and the National Privacy Commission as the law requires.",
          tl: "Walang sistemang lubos na ligtas. Kung magkaroon ng paglabag na maglalagay sa panganib ng impormasyon mo, ipapaalam namin ito sa iyo at sa National Privacy Commission ayon sa batas.",
        } },
      ],
    },
    {
      id: "keep",
      title: { en: "How long we keep it", tl: "Gaano katagal namin ito itinatago" },
      body: [
        { list: {
          en: [
            "As long as you have an account.",
            "When you delete your account, your profile, listings, photos and records are deleted right away.",
            "Orders stay in the other person's history, because they are that person's record of the sale too, but with your name removed.",
            "Copies in routine backups are removed within 30 days.",
          ],
          tl: [
            "Hangga't may account ka.",
            "Kapag binura mo ang account mo, agad na nabubura ang profile, paninda, litrato at mga tala mo.",
            "Nananatili ang mga order sa history ng kabilang panig, dahil tala rin niya ito ng benta, pero wala na ang pangalan mo.",
            "Ang mga kopya sa regular na backup ay nabubura sa loob ng 30 araw.",
          ],
        } },
      ],
    },
    {
      id: "rights",
      title: { en: "Your rights", tl: "Ang mga karapatan mo" },
      body: [
        { p: { en: "Under the Data Privacy Act you have the right to:", tl: "Sa ilalim ng Data Privacy Act, may karapatan kang:" } },
        { list: {
          en: [
            "Know what information we hold about you and how it is used.",
            "Get a copy of it.",
            "Have it corrected. Most of it you can change yourself in Profile.",
            "Object to how it is used, or withdraw your consent.",
            "Have it deleted.",
            "Complain to the National Privacy Commission (privacy.gov.ph) if you believe your rights were violated.",
          ],
          tl: [
            "Malaman kung anong impormasyon mo ang hawak namin at paano ito ginagamit.",
            "Makakuha ng kopya nito.",
            "Ipatama ito. Karamihan dito ay mababago mo mismo sa Profile.",
            "Tumutol sa paggamit nito, o bawiin ang pahintulot mo.",
            "Ipabura ito.",
            "Magreklamo sa National Privacy Commission (privacy.gov.ph) kung sa tingin mo ay nalabag ang karapatan mo.",
          ],
        } },
        { p: {
          en: "To use any of these, write to {email}. We will answer within 30 days.",
          tl: "Para gamitin ang alinman dito, sumulat sa {email}. Sasagot kami sa loob ng 30 araw.",
        } },
      ],
    },
    {
      id: "delete",
      title: { en: "Deleting your account", tl: "Pagbura ng account mo" },
      body: [
        { p: {
          en: "In the app, go to Profile, scroll to the bottom and tap “Delete my account”. If you no longer have the app, you can delete your account from our website, or write to {email}.",
          tl: "Sa app, pumunta sa Profile, mag-scroll sa pinakababa at pindutin ang “Burahin ang account ko”. Kung wala na sa iyo ang app, puwede mong burahin ang account sa website namin, o sumulat sa {email}.",
        } },
      ],
    },
    {
      id: "children",
      title: { en: "Children", tl: "Mga bata" },
      body: [
        { p: {
          en: "AniSense is for adults. We do not knowingly collect information from anyone under 18. If you believe a child has created an account, write to us and we will delete it.",
          tl: "Para sa mga nasa hustong gulang ang AniSense. Hindi namin sinasadyang kumuha ng impormasyon mula sa sinumang wala pang 18. Kung sa tingin mo ay may batang gumawa ng account, sumulat sa amin at buburahin namin ito.",
        } },
      ],
    },
    {
      id: "changes",
      title: { en: "Changes to this policy", tl: "Mga pagbabago sa patakarang ito" },
      body: [
        { p: {
          en: "If we change what we collect or how we use it, we will update this page and its date, and tell you in the app before the change takes effect.",
          tl: "Kapag binago namin ang kinukuha o kung paano ito ginagamit, ia-update namin ang pahinang ito at ang petsa nito, at ipapaalam sa iyo sa app bago ito magkabisa.",
        } },
      ],
    },
    {
      id: "contact",
      title: { en: "Contact us", tl: "Makipag-ugnayan sa amin" },
      body: [
        { p: {
          en: "{operator}, {place}. Email: {email}.",
          tl: "{operator}, {place}. Email: {email}.",
        } },
      ],
    },
  ] as PrivacySection[],
};

/** Fills {operator}, {place} and {email} into a line of the policy. */
export const fillPrivacy = (s: string) =>
  s.replace(/\{operator\}/g, PRIVACY.operator).replace(/\{place\}/g, PRIVACY.place).replace(/\{email\}/g, PRIVACY.email);

/** "October 1, 2026" / "Oktubre 1, 2026". */
export const privacyDate = (lang: "en" | "tl") =>
  new Date(`${PRIVACY.effective}T00:00:00`).toLocaleDateString(lang === "tl" ? "fil-PH" : "en-PH", { year: "numeric", month: "long", day: "numeric" });
