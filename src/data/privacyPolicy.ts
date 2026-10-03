// ─── Privacy policy ───────────────────────────────────────────────────────────
// The one copy of the policy. The app shows it (Profile, under Manage
// account, and from the welcome screen), and `node scripts/build-privacy.mjs` writes the web page Google
// Play links to (site/privacy-policy.html) from this same file, so the two
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
//
// English only, in both app languages and on the web page. This is the
// owner's decision: one text, so there is never a question of which version
// is the binding one. Do not add a translation.

export type PrivacyBlock = { p: string } | { list: string[] };
export interface PrivacySection { id: string; title: string; body: PrivacyBlock[] }

export const PRIVACY = {
  /** ISO date this version took effect. */
  effective: "2026-10-01",
  operator: "Ruzly Macatula",
  place: "Manila, Philippines",
  email: "AniSense2026@gmail.com",
  title: "Privacy Policy",
  effectiveLabel: "In effect from {date}",

  sections: [
    {
      id: "short",
      title: "The short version",
      body: [
        { list: [
          "We collect only what the app needs: your name, how to reach you, where you are, and what you sell, buy and record.",
          "We do not sell your information, and there are no ads.",
          "We do not track your location with GPS. Your town is whatever you pick from the list.",
          "Your expenses and farm records are private. Only you can see them.",
          "You can delete your account and your data at any time.",
        ] },
      ],
    },
    {
      id: "who",
      title: "Who we are",
      body: [
        { p: "AniSense is a mobile app for farmers in Nueva Ecija and for buyers anywhere in the Philippines. It is run by {operator}, based in {place}, who is responsible for the information described here. To reach us about your privacy, write to {email}." },
        { p: "This policy follows the Data Privacy Act of 2012 (Republic Act No. 10173)." },
      ],
    },
    {
      id: "collect",
      title: "What we collect",
      body: [
        { p: "What you give us when you create an account:" },
        { list: [
          "Your full name, and whether you are a farmer or a buyer.",
          "Your mobile number or your Gmail address, and a password. The password is stored scrambled; nobody at AniSense can read it.",
          "Where you are: for a farmer, the barangay and town of the farm; for a buyer, the province and city or town, and the barangay if you choose to give it.",
          "For farmers: how many years you have farmed, the crops you grow, and the number buyers can call.",
        ] },
        { p: "What is created as you use the app:" },
        { list: [
          "Listings you post: the crop, description, price, quantity, place and photo.",
          "Orders: what was bought, how much, at what price, and between which buyer and farmer.",
          "A farmer's own records: expenses, sales, plantings, price alerts and expected harvests.",
          "Badges you have earned.",
        ] },
        { p: "What stays on your phone and is not sent to us:" },
        { list: [
          "A photo you add to your member ID.",
          "Your language choice, and a saved copy of prices and your records so the app works without signal.",
        ] },
        { p: "What we do not collect:" },
        { list: [
          "Your GPS location, your contacts, your text messages or your call history.",
          "Payment details. No payment is made in the app; the buyer and the farmer arrange it themselves.",
          "Advertising or tracking identifiers. The app has no ads and no analytics trackers.",
        ] },
      ],
    },
    {
      id: "why",
      title: "Why we use it",
      body: [
        { list: [
          "To create your account and sign you in.",
          "To show your harvests to buyers, and to let a buyer and a farmer reach each other about an order.",
          "To keep your expenses, sales and farm records and work out your profit.",
          "To show prices, forecasts and weather for the crops and the place you chose.",
          "To keep the app safe: to stop misuse and to fix problems.",
        ] },
        { p: "We use your information because you agreed to it when you created your account, and because the app cannot provide these services without it. We do not use it for anything else." },
      ],
    },
    {
      id: "see",
      title: "Who can see it",
      body: [
        { p: "Other people using AniSense:" },
        { list: [
          "A farmer's name, town, years of farming, crops, rating, phone number and listings can be seen by anyone signed in. That is how buyers find and call farmers.",
          "A buyer's name, phone number and location can be seen only by farmers that buyer has ordered from.",
          "Expenses, sales records, plantings, price alerts and expected harvests can be seen only by the farmer who wrote them.",
          "Nobody can see anything without signing in. A listing photo, though, is stored at a web address that anyone who has the link can open.",
        ] },
        { p: "Companies that help us run the app, and only for that purpose:" },
        { list: [
          "Supabase, which hosts the database, the sign-in and the photos.",
          "Semaphore, our SMS provider in the Philippines: when phone verification is on, your mobile number is sent to it only to deliver your code.",
          "Google Fonts, which supplies the app's typefaces. Like any internet request, this shows Google your phone's internet address.",
        ] },
        { p: "We do not sell or rent your information to anyone. We share it with the authorities only when the law requires it." },
      ],
    },
    {
      id: "where",
      title: "Where it is kept, and how it is protected",
      body: [
        { p: "Your information is stored on Supabase's servers in Singapore, which is outside the Philippines." },
        { list: [
          "Everything travels between your phone and the servers encrypted.",
          "The database itself enforces who can see what, so the rules above hold even if the app is tampered with.",
          "Passwords are stored scrambled and cannot be read back.",
        ] },
        { p: "No system is perfectly safe. If a breach ever puts your information at risk, we will tell you and the National Privacy Commission as the law requires." },
      ],
    },
    {
      id: "keep",
      title: "How long we keep it",
      body: [
        { list: [
          "As long as you have an account.",
          "When you delete your account, your profile, listings, photos and records are deleted right away.",
          "Orders stay in the other person's history, because they are that person's record of the sale too, but with your name removed.",
          "Copies in routine backups are removed within 30 days.",
        ] },
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      body: [
        { p: "Under the Data Privacy Act you have the right to:" },
        { list: [
          "Know what information we hold about you and how it is used.",
          "Get a copy of it.",
          "Have it corrected. Most of it you can change yourself in Profile.",
          "Object to how it is used, or withdraw your consent.",
          "Have it deleted.",
          "Complain to the National Privacy Commission (privacy.gov.ph) if you believe your rights were violated.",
        ] },
        { p: "To use any of these, write to {email}. We will answer within 30 days." },
      ],
    },
    {
      id: "delete",
      title: "Deleting your account",
      body: [
        { p: "In the app, go to Profile and, under Manage account, tap “Delete my account”. If you no longer have the app, you can delete your account from our website, or write to {email}." },
      ],
    },
    {
      id: "children",
      title: "Children",
      body: [
        { p: "AniSense is for adults. We do not knowingly collect information from anyone under 18. If you believe a child has created an account, write to us and we will delete it." },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: [
        { p: "If we change what we collect or how we use it, we will update this page and its date, and tell you in the app before the change takes effect." },
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      body: [
        { p: "{operator}, {place}. Email: {email}." },
      ],
    },
  ] as PrivacySection[],
};

/** Fills {operator}, {place} and {email} into a line of the policy. */
export const fillPrivacy = (s: string) =>
  s.replace(/\{operator\}/g, PRIVACY.operator).replace(/\{place\}/g, PRIVACY.place).replace(/\{email\}/g, PRIVACY.email);

/** "October 1, 2026". */
export const privacyDate = () =>
  new Date(`${PRIVACY.effective}T00:00:00`).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
