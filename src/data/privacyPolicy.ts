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
/** A legal document the app shows: this policy, or the Terms of Service.
 *  The first section is the short version, set apart at the top. */
export interface LegalDocData { effective: string; title: string; effectiveLabel: string; sections: PrivacySection[] }

export const PRIVACY = {
  /** ISO date this version took effect. */
  effective: "2026-10-12",
  operator: "Ruzly Macatula",
  place: "Manila, Philippines",
  email: "AniSense2026@gmail.com",
  title: "Privacy Policy",
  effectiveLabel: "In effect from {date}",

  sections: [
    {
      "id": "short",
      "title": "The short version",
      "body": [
        {
          "list": [
            "We collect only what the app needs: your name, how to reach you, where you are, and what you sell, buy and record.",
            "We do not sell your information, and there are no ads.",
            "We do not track your location with GPS. Your town is whatever you pick from the list.",
            "Your expenses and farm records are private. Only you can see them.",
            "You can delete your account and your data at any time."
          ]
        }
      ]
    },
    {
      "id": "introduction",
      "title": "Introduction",
      "body": [
        {
          "p": "Mobile-Based Crop Market Monitoring System Using Predictive Analytics for Local Farmers"
        },
        {
          "p": "Last updated: October 20, 2026."
        },
        {
          "p": "Application: AniSense. Developer: AniSense Research Team, University of the East – Manila, College of Computer Studies and Systems. Privacy contact: {operator}, {place}. Email: {email}."
        },
        {
          "p": "AniSense is an Android mobile application developed as an academic research project by Bachelor of Science in Computer Science students of the University of the East – Manila, College of Computer Studies and Systems."
        },
        {
          "p": "The Application aims to help local farmers and buyers in the Philippines access agricultural market information, monitor crop prices, manage farming or purchasing expenses, and make informed decisions using predictive analytics."
        },
        {
          "p": "AniSense focuses on four agricultural crops: rice, garlic, onion, and calamansi. Its features include crop market monitoring, historical price trends, predictive analytics, expense management, a direct marketplace, weather forecasts, farming advisories, and user profile management."
        },
        {
          "p": "This Privacy Policy explains how AniSense collects, uses, stores, shares, protects, and deletes personal information and other data when users access or use the Application."
        },
        {
          "p": "We are committed to respecting the privacy of farmers, buyers, and other users in accordance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations, applicable National Privacy Commission issuances, and relevant Google Play policies."
        },
        {
          "p": "By using AniSense, you acknowledge that this Privacy Policy has been made available to you. Where consent is required, we will obtain it before the relevant data processing activity begins."
        }
      ]
    },
    {
      "id": "scope",
      "title": "Scope of This Privacy Policy",
      "body": [
        {
          "p": "This Privacy Policy covers information processed through the AniSense Android application and its associated backend services, databases, marketplace, and integrated external services."
        },
        {
          "p": "It also explains how information associated with user accounts and marketplace activities is handled."
        },
        {
          "p": "Academic research activities, including survey questionnaires and respondent information collected to evaluate the system, are subject to the separate research data protection procedures described in Section 12."
        }
      ]
    },
    {
      "id": "collect",
      "title": "Information We Collect",
      "body": [
        {
          "p": "The information processed by AniSense depends on the features users access and the information they voluntarily provide."
        },
        {
          "p": "3.1 Account and Profile Information:"
        },
        {
          "p": "When users register for an account and use AniSense, the Application may process:"
        },
        {
          "list": [
            "Name or display name.",
            "Email address and contact information.",
            "Account authentication information.",
            "User role, such as farmer or buyer.",
            "Location information provided for the user's profile.",
            "Farming experience and crop specialization, when applicable.",
            "Farm statistics and other profile details voluntarily provided by the user.",
            "User preferences and account settings."
          ]
        },
        {
          "p": "This information is used to establish user accounts, personalize features, and support interactions between farmers and buyers."
        },
        {
          "p": "Passwords are stored scrambled, not in plain text, and cannot be read back."
        },
        {
          "p": "3.2 Agricultural and Marketplace Information:"
        },
        {
          "p": "Farmers may provide information related to crop production and selling activities, including:"
        },
        {
          "list": [
            "Crop type and specialization.",
            "Available crop quantity.",
            "Selling price per kilogram.",
            "Listing location.",
            "Farming experience and relevant farm statistics.",
            "Seller ratings and marketplace listing information."
          ]
        },
        {
          "p": "Buyers may access crop listings and provide information associated with their marketplace activity."
        },
        {
          "p": "Information displayed publicly or to other users will be limited to what is necessary for marketplace functionality. Private account information must not be exposed without an appropriate legal basis."
        },
        {
          "p": "3.3 Expense and Transaction Information:"
        },
        {
          "p": "AniSense provides expense management features that allow farmers and buyers to record and monitor expenses."
        },
        {
          "p": "Depending on the user's activity, this information may include:"
        },
        {
          "list": [
            "Expense categories and descriptions.",
            "Crop-related production expenses, including seeds, fertilizers, labor, equipment, and irrigation.",
            "Purchase-related expenses.",
            "Expense amounts and dates.",
            "Transaction records entered by the user.",
            "Expense summaries, charts, and historical records."
          ]
        },
        {
          "p": "This information is processed to generate expense summaries, track spending, and help users evaluate farming costs or purchasing activities."
        },
        {
          "p": "Users should avoid entering unnecessary personal or confidential information in free-text fields."
        },
        {
          "p": "3.4 Crop Market and Predictive Analytics Information:"
        },
        {
          "p": "AniSense processes agricultural market information to display current retail crop prices, historical price movements, supply information, and price forecasts."
        },
        {
          "p": "The Application uses crop market data associated with sources identified in the research, including the Department of Agriculture, PhilRice Data Analytics Center, RiceLyTics, and the Philippine Statistics Authority."
        },
        {
          "p": "The Application uses ARIMA for short-term price forecasting and LSTM for medium-term forecasting, as described in the research project."
        },
        {
          "p": "Public or institutional market datasets are distinct from personal information supplied by users. Market data will be processed for monitoring, analysis, and forecasting."
        },
        {
          "p": "3.5 Location Information:"
        },
        {
          "p": "AniSense may process a municipality, province, or other location entered by the user to display relevant market listings and facilitate transactions within Nueva Ecija."
        },
        {
          "p": "A location included in a public crop listing may be visible to other users."
        },
        {
          "p": "We do not track your location with GPS. Your location is the barangay, town, city or province you select in the app. If a future version accesses precise device location, we will disclose that collection and obtain the required permissions before it begins."
        },
        {
          "p": "3.6 Device and Technical Information:"
        },
        {
          "p": "The Application and its integrated services may process limited technical information needed to operate and maintain the system, such as application version, Android compatibility information, and diagnostic or error information."
        },
        {
          "p": "The exact information collected depends on the deployed application and any third-party SDKs or services integrated into it."
        },
        {
          "p": "AniSense will disclose additional analytics, advertising identifiers, or other device information if those technologies are implemented and collect such information."
        },
        {
          "p": "Additional details about the current app:"
        },
        {
          "p": "What you give us when you create an account:"
        },
        {
          "list": [
            "Your full name, and whether you are a farmer or a buyer.",
            "Your mobile number or your Gmail address, and a password. The password is stored scrambled; nobody at AniSense can read it.",
            "Where you are: for a farmer, the barangay and town of the farm; for a buyer, the province and city or town, and the barangay if you choose to give it.",
            "For farmers: how many years you have farmed, the crops you grow, and the number buyers can call."
          ]
        },
        {
          "p": "What is created as you use the app:"
        },
        {
          "list": [
            "Listings you post: the crop, description, price, quantity, place and photo.",
            "Orders: what was bought, how much, at what price, and between which buyer and farmer.",
            "A farmer's own records: expenses, sales, plantings, price alerts and expected harvests.",
            "Badges you have earned."
          ]
        },
        {
          "p": "What stays on your phone and is not sent to us:"
        },
        {
          "list": [
            "A photo you add to your member ID.",
            "Your language choice, and a saved copy of prices and your records so the app works without signal."
          ]
        },
        {
          "p": "What we do not collect:"
        },
        {
          "list": [
            "Your GPS location, your contacts, your text messages or your call history.",
            "Payment details. No payment is made in the app; the buyer and the farmer arrange it themselves.",
            "Advertising or tracking identifiers. The app has no ads and no analytics trackers."
          ]
        }
      ]
    },
    {
      "id": "why",
      "title": "How We Use Information",
      "body": [
        {
          "p": "AniSense processes information for the following purposes:"
        },
        {
          "list": [
            "To register, authenticate, and manage user accounts.",
            "To display crop market prices for rice, garlic, onion, and calamansi.",
            "To provide historical price trends and predictive market forecasts.",
            "To personalize market information according to user preferences and crop specialization.",
            "To enable farmers to create and manage crop listings.",
            "To allow buyers to browse available crops and contact sellers.",
            "To help users record, review, edit, and delete their expense entries.",
            "To display weather conditions, forecasts, and farming advisories.",
            "To maintain the Application's functionality, security, and reliability.",
            "To investigate technical problems and respond to user requests.",
            "To improve the Application through appropriate testing and maintenance.",
            "To comply with applicable legal obligations."
          ]
        },
        {
          "p": "We will not use personal information for a materially different purpose without an appropriate legal basis and any required notice or consent."
        }
      ]
    },
    {
      "id": "legal-basis",
      "title": "Legal Basis for Processing",
      "body": [
        {
          "p": "Personal information will be processed only when a lawful basis exists under the Data Privacy Act of 2012 and applicable regulations."
        },
        {
          "p": "Depending on the activity, the legal basis may include the user's consent, the necessity of processing to provide a requested service, compliance with a legal obligation, or another lawful basis recognized by applicable law."
        },
        {
          "p": "When consent is the applicable basis, users may withdraw consent subject to legal requirements. Withdrawal will not affect the lawfulness of processing that occurred before withdrawal."
        },
        {
          "p": "We will seek to ensure that information collected is adequate, relevant, necessary, and proportionate to the intended purpose."
        }
      ]
    },
    {
      "id": "keep",
      "title": "Data Storage and Retention",
      "body": [
        {
          "p": "Your information is stored on Supabase's servers in Singapore, which is outside the Philippines."
        },
        {
          "p": "A saved copy of prices and your records is kept on your phone so the app works without signal. Cached market information may become outdated and should not be treated as a real-time price update."
        },
        {
          "list": [
            "As long as you have an account.",
            "When you delete your account, your profile, listings, photos and records are deleted right away.",
            "Orders stay in the other person's history, because they are that person's record of the sale too, but with your name removed.",
            "Copies in routine backups are removed within 30 days."
          ]
        }
      ]
    },
    {
      "id": "see",
      "title": "Data Sharing and Disclosure",
      "body": [
        {
          "p": "AniSense does not authorize the sale of users' personal information."
        },
        {
          "p": "Information may be shared or made accessible in the following circumstances:"
        },
        {
          "p": "7.1 Other AniSense Users:"
        },
        {
          "p": "Farmers' crop listings and relevant seller details may be displayed to buyers so they can evaluate available crops and contact sellers."
        },
        {
          "p": "Information intentionally included in a public listing, such as crop type, quantity, price, and listing location, may be visible to other users."
        },
        {
          "p": "Users should carefully review the information they publish."
        },
        {
          "p": "7.2 Third-Party Service Providers:"
        },
        {
          "p": "AniSense may rely on third-party providers for services such as hosting, database infrastructure, authentication, weather data, or other technical functions, where those services are implemented."
        },
        {
          "p": "Such providers may process information as necessary to deliver their services, subject to applicable privacy requirements and contractual safeguards."
        },
        {
          "p": "7.3 Agricultural Data Sources:"
        },
        {
          "p": "AniSense uses or intends to use agricultural market data from sources identified in the research, including the Department of Agriculture, PhilRice Data Analytics Center, RiceLyTics, and the Philippine Statistics Authority."
        },
        {
          "p": "These sources provide market or agricultural information for monitoring and predictive analysis. Their inclusion does not mean that they automatically receive users' personal information."
        },
        {
          "p": "7.4 Legal Disclosure:"
        },
        {
          "p": "Information may be disclosed when required by applicable law or pursuant to a valid and lawful request from an authorized authority."
        },
        {
          "p": "We will seek to limit any disclosure to the information reasonably necessary for the applicable purpose."
        },
        {
          "p": "Current visibility rules and service providers:"
        },
        {
          "p": "Other people using AniSense:"
        },
        {
          "list": [
            "A farmer's name, town, years of farming, crops, rating, phone number and listings can be seen by anyone signed in. That is how buyers find and call farmers.",
            "A buyer's name, phone number and location can be seen only by farmers that buyer has ordered from.",
            "Expenses, sales records, plantings, price alerts and expected harvests can be seen only by the farmer who wrote them.",
            "Nobody can see anything without signing in. A listing photo, though, is stored at a web address that anyone who has the link can open."
          ]
        },
        {
          "p": "Companies that help us run the app, and only for that purpose:"
        },
        {
          "list": [
            "Supabase, which hosts the database, the sign-in and the photos.",
            "Semaphore, our SMS provider in the Philippines: when phone verification is on, your mobile number is sent to it only to deliver your code.",
            "Brevo, which sends our emails: when you sign up or reset your password with Gmail, your Gmail address is sent to it only to deliver your code.",
            "Google Fonts, which supplies the app's typefaces. Like any internet request, this shows Google your phone's internet address.",
            "Open-Meteo, which supplies the weather forecast: the app sends it the name of a farmer's town, to find the town on the map, and that town's map coordinates. Your name, number and account are never sent. Like any internet request, this shows Open-Meteo your phone's internet address."
          ]
        },
        {
          "p": "We do not sell or rent your information to anyone. We share it with the authorities only when the law requires it."
        }
      ]
    },
    {
      "id": "security",
      "title": "Security Measures",
      "body": [
        {
          "p": "AniSense will implement reasonable organizational, physical, and technical measures to protect personal information against unauthorized access, alteration, disclosure, loss, or destruction."
        },
        {
          "p": "Depending on the deployed infrastructure, these measures may include:"
        },
        {
          "list": [
            "Secure authentication and restricted account access.",
            "Encrypted network communication.",
            "Access controls for backend systems and databases.",
            "Secure password handling.",
            "Restricted access to administrative functions.",
            "Appropriate backup and recovery procedures.",
            "Software updates and security reviews."
          ]
        },
        {
          "p": "Access to personal information should be limited to authorized individuals who need it to operate, maintain, or support the Application."
        },
        {
          "p": "No electronic system can be guaranteed to be completely secure. If a personal data breach occurs, the responsible party will assess and address it in accordance with applicable legal requirements, including notification obligations where required."
        },
        {
          "list": [
            "Everything travels between your phone and the servers encrypted.",
            "The database itself enforces who can see what, so the rules above hold even if the app is tampered with.",
            "Passwords are stored scrambled and cannot be read back."
          ]
        },
        {
          "p": "No system is perfectly safe. If a breach ever puts your information at risk, we will tell you and the National Privacy Commission as the law requires."
        }
      ]
    },
    {
      "id": "rights",
      "title": "User Rights and Choices",
      "body": [
        {
          "p": "Subject to the conditions and exceptions provided by applicable law, AniSense users may exercise their rights to:"
        },
        {
          "list": [
            "Be informed about the processing of their personal information.",
            "Access their personal information.",
            "Request correction of inaccurate or incomplete information.",
            "Object to certain processing activities.",
            "Request blocking, erasure, or destruction of information where legally justified.",
            "Withdraw consent when consent is the applicable legal basis.",
            "Request data portability when applicable.",
            "Lodge a complaint with the National Privacy Commission.",
            "Seek applicable remedies under Philippine law."
          ]
        },
        {
          "p": "Users may also edit or delete their expense records through the relevant functionality, where available."
        },
        {
          "p": "To exercise a privacy right, users may contact the AniSense privacy contact identified in Section 15. We may request reasonable verification before acting on a request."
        },
        {
          "p": "To exercise these rights, write to {email}. We will answer within 30 days. Most profile information can be corrected in Profile."
        }
      ]
    },
    {
      "id": "delete",
      "title": "Account Deletion",
      "body": [
        {
          "p": "In the app, go to Profile and, under Manage account, tap “Delete my account”. If you no longer have the app, you can delete your account from our website, or write to {email}."
        },
        {
          "p": "Deleting an account removes access to saved profile information, expense records, listings and other account-related features."
        },
        {
          "list": [
            "When you delete your account, your profile, listings, photos and records are deleted right away.",
            "Orders stay in the other person's history, because they are that person's record of the sale too, but with your name removed.",
            "Copies in routine backups are removed within 30 days."
          ]
        }
      ]
    },
    {
      "id": "weather",
      "title": "Weather Services and Other External Integrations",
      "body": [
        {
          "p": "AniSense uses Open-Meteo to provide weather forecasts. The app sends the name of a farmer's town to find the town on the map, and that town's map coordinates. Your name, number and account are never sent. Like any internet request, this shows Open-Meteo your phone's internet address."
        },
        {
          "p": "Other current service providers and the information they process are described in Section 7. If additional external services are introduced, this Privacy Policy and the Application's disclosures will be updated as necessary."
        }
      ]
    },
    {
      "id": "research",
      "title": "Academic Research and Survey Data",
      "body": [
        {
          "p": "AniSense was developed as part of an academic research project. Research questionnaires and respondent information collected to evaluate the system are distinct from information processed during ordinary app use."
        },
        {
          "p": "The research procedures described in the study include online Google Forms questionnaires and paper-based questionnaires for participants who need an alternative method."
        },
        {
          "p": "Research information may include responses concerning agricultural market practices, digital literacy, system usability, and the perceived impact of the Application."
        },
        {
          "p": "The research team will:"
        },
        {
          "list": [
            "Obtain informed consent before collecting survey responses.",
            "Make participation voluntary.",
            "Allow participants to decline questions or withdraw from the study, subject to applicable research procedures.",
            "Limit access to research records to authorized research team members.",
            "Store digital research records in a password-protected Google Drive account with restricted access.",
            "Store physical questionnaires securely until they are processed and disposed of.",
            "Remove or code personal identifiers where appropriate.",
            "Analyze and report results in aggregate form where possible.",
            "Retain and dispose of research records according to institutional and ethical requirements."
          ]
        },
        {
          "p": "Research information will be used for the approved academic research purposes and will not automatically be added to the Application's user database."
        },
        {
          "p": "Requests concerning research participant records may be directed to the research team using the contact information in Section 15."
        }
      ]
    },
    {
      "id": "forecasts",
      "title": "Predictive Analytics and Farming Advisories",
      "body": [
        {
          "p": "AniSense provides price forecasts and weather-related farming advisories to help users make informed agricultural decisions."
        },
        {
          "p": "Forecasts are generated from historical market data and relevant model inputs. Actual prices may differ because of changes in supply, demand, weather, government policies, and other market conditions."
        },
        {
          "p": "The Application does not guarantee future crop prices, profitability, or agricultural outcomes. Users should consider local conditions and exercise independent judgment before making financial, selling, planting, or harvesting decisions."
        }
      ]
    },
    {
      "id": "children",
      "title": "Children's Privacy",
      "body": [
        {
          "p": "AniSense is for adults. We do not knowingly collect information from anyone under 18. If you believe a child has created an account, write to us and we will delete it."
        }
      ]
    },
    {
      "id": "contact",
      "title": "Contact Information",
      "body": [
        {
          "p": "For privacy inquiries, access or correction requests, account deletion, research participant requests, or other concerns about personal information, please contact:"
        },
        {
          "list": [
            "Application: AniSense.",
            "Developer / Organization: AniSense Research Team.",
            "Institution: University of the East – Manila, College of Computer Studies and Systems.",
            "Privacy contact and app operator: {operator}, {place}.",
            "Email address: {email}."
          ]
        },
        {
          "p": "The Privacy Policy is available in the app and on our website. To delete your account, go to Profile → Manage account → Delete my account, use our website's account deletion page, or write to {email}."
        },
        {
          "p": "For additional information about the Philippine Data Privacy Act, users may visit the official website of the National Privacy Commission at https://privacy.gov.ph/."
        }
      ]
    },
    {
      "id": "changes",
      "title": "Changes to This Privacy Policy",
      "body": [
        {
          "p": "We may update this Privacy Policy when the Application's features, data processing practices, integrated services, or applicable requirements change."
        },
        {
          "p": "The revised version will include an updated date and will be made available through the designated Privacy Policy webpage and, where appropriate, the Application."
        },
        {
          "p": "Material changes will be communicated and handled in accordance with applicable legal requirements and Google Play policies."
        },
        {
          "p": "If we change what we collect or how we use it, we will update this page and its date, and tell you in the app before the change takes effect."
        }
      ]
    },
    {
      "id": "acknowledgment",
      "title": "Acknowledgment",
      "body": [
        {
          "p": "By using AniSense, users acknowledge that this Privacy Policy is available for their review."
        },
        {
          "p": "Where separate consent is required for particular data processing activities, the Application will request that consent through an appropriate mechanism."
        },
        {
          "p": "Users may choose not to provide optional information, although certain features may not function without information necessary to provide those features."
        }
      ]
    }
  ] as PrivacySection[],
};

/** Fills {operator}, {place} and {email} into a line of the policy. */
export const fillPrivacy = (s: string) =>
  s.replace(/\{operator\}/g, PRIVACY.operator).replace(/\{place\}/g, PRIVACY.place).replace(/\{email\}/g, PRIVACY.email);

/** "October 1, 2026": a document's effective date, the policy's by default. */
export const privacyDate = (effective: string = PRIVACY.effective) =>
  new Date(`${effective}T00:00:00`).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
