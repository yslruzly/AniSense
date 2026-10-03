import type { LegalDocData } from "./privacyPolicy";

// ─── Terms of Service ─────────────────────────────────────────────────────────
// The rules for using AniSense, agreed to when an account is created and
// readable later from Profile, under Manage account. Same shape as the
// Privacy Policy, shown by the same document view.
//
// DRAFT: written from how the app actually works (it connects farmers and
// buyers; it takes no payment and arranges no delivery; prices and forecasts
// are guides), but not yet reviewed by a lawyer. Have it checked before the
// Play Store release, together with the Privacy Policy.
//
// English only, like the Privacy Policy: one text, so there is never a
// question of which version is the binding one.

export const TERMS: LegalDocData = {
  /** ISO date this version took effect. */
  effective: "2026-10-03",
  title: "Terms of Service",
  effectiveLabel: "In effect from {date}",

  sections: [
    {
      id: "short",
      title: "The short version",
      body: [
        { list: [
          "AniSense connects farmers and buyers. The sale itself is between the two of you.",
          "No payment goes through the app. You agree on payment and pickup with each other, by phone.",
          "Prices and forecasts are a guide, not a promise. Check your local market too.",
          "Be honest in what you post and in what you order.",
          "You can delete your account at any time.",
        ] },
      ],
    },
    {
      id: "who",
      title: "Who we are, and these terms",
      body: [
        { p: "AniSense is a mobile app for farmers in Nueva Ecija and for buyers anywhere in the Philippines. It is run by {operator}, based in {place}." },
        { p: "These terms are the agreement between you and AniSense when you use the app. By creating an account, you agree to them and to the Privacy Policy, which explains what information we keep and why." },
      ],
    },
    {
      id: "account",
      title: "Your account",
      body: [
        { list: [
          "You must be 18 or older to create an account.",
          "Give your real name, and a CP number or Gmail address that is yours.",
          "One account per person. Do not create an account for someone else without their permission.",
          "Keep your password to yourself. You are responsible for what is done with your account.",
          "If you think someone else is using your account, change your password and write to {email}.",
        ] },
      ],
    },
    {
      id: "market",
      title: "Selling and buying",
      body: [
        { p: "AniSense shows listings and passes orders between farmers and buyers. It is not the seller, the buyer, or a delivery service, and it is not a party to the sale." },
        { p: "If you sell:" },
        { list: [
          "Describe your harvest truthfully: the crop, the variety, the kilos you have, and its condition.",
          "Use a photo of the harvest you are actually selling.",
          "Keep your listings up to date, and remove a listing once it is sold.",
          "Sell only produce you grew or have the right to sell, and that is safe to eat.",
          "Call the buyer to agree on payment and pickup before you confirm an order.",
        ] },
        { p: "If you buy:" },
        { list: [
          "Order only what you mean to buy.",
          "Pay and collect as you agreed with the farmer.",
          "Check the produce when you collect it. Raise any problem with the farmer directly.",
        ] },
        { p: "Price, quantity, payment and delivery are agreed between farmer and buyer. AniSense does not hold money, and does not guarantee that an order will be completed." },
      ],
    },
    {
      id: "prices",
      title: "Prices, forecasts and weather",
      body: [
        { p: "The prices in AniSense are monthly retail records. The forecasts come from statistical models trained on those records, and the app shows how far off each model has been. Weather is shown for planning." },
        { p: "All of these are a guide to help you decide. They can be wrong, and they are not financial advice. Check what traders and markets near you are actually paying before you buy, sell or hold a harvest." },
      ],
    },
    {
      id: "rules",
      title: "What you must not do",
      body: [
        { list: [
          "Post false, misleading or copied listings, or prices meant to deceive.",
          "Harass, threaten or cheat other users.",
          "Use another person's phone number or details without their permission.",
          "Pretend to be someone else, or to be AniSense.",
          "Send spam, or use the app for anything other than buying and selling produce and keeping your farm records.",
          "Try to get around the app's security, or copy its data in bulk.",
        ] },
      ],
    },
    {
      id: "content",
      title: "What you post",
      body: [
        { p: "The photos and descriptions you post remain yours. By posting them, you allow AniSense to show them in the app so that buyers can see your harvest." },
        { p: "We may remove a listing, or suspend an account, that breaks these terms." },
      ],
    },
    {
      id: "ending",
      title: "Ending your account",
      body: [
        { p: "You can delete your account at any time: in the app, go to Profile and, under Manage account, tap “Delete my account”. What happens to your information then is explained in the Privacy Policy." },
        { p: "We may suspend or close an account that breaks these terms, or that puts other users at risk." },
      ],
    },
    {
      id: "liability",
      title: "Our responsibility",
      body: [
        { p: "We work to keep AniSense running and its information accurate, but the app is provided as it is, and it may sometimes be unavailable or wrong." },
        { p: "As far as the law allows, AniSense is not responsible for the quality of produce, for disputes between farmers and buyers, or for losses from decisions made on its prices, forecasts or weather." },
        { p: "Nothing in these terms takes away your rights under Philippine law, including the Consumer Act of the Philippines (Republic Act No. 7394)." },
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: [
        { p: "If we change these terms, we will update this page and its date, and tell you in the app before the change takes effect. If you keep using AniSense after that, you accept the new terms." },
      ],
    },
    {
      id: "law",
      title: "The law that applies",
      body: [
        { p: "These terms are governed by the laws of the Republic of the Philippines." },
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      body: [
        { p: "{operator}, {place}. Email: {email}." },
      ],
    },
  ],
};
