# AniSense architecture

This document describes how AniSense is built: its parts, how they depend on each other, how data moves, and the decisions behind that. For setup and build instructions see [README.md](README.md) and [SETUP_DATABASE.md](SETUP_DATABASE.md); for the database tables see [supabase/README.md](supabase/README.md).

## Contents

1. [System overview](#1-system-overview)
2. [Constraints that shaped the design](#2-constraints-that-shaped-the-design)
3. [Client architecture](#3-client-architecture)
4. [Backend architecture](#4-backend-architecture)
5. [Key flows](#5-key-flows)
6. [Offline design](#6-offline-design)
7. [Security](#7-security)
8. [Build and delivery](#8-build-and-delivery)
9. [Decision log](#9-decision-log)
10. [Known limitations and planned work](#10-known-limitations-and-planned-work)

## 1. System overview

AniSense is a single-codebase mobile app: a React and TypeScript web app packaged for Android with Capacitor, backed by Supabase.

```mermaid
flowchart TB
  subgraph Users
    Farmer["Farmer"]
    Buyer["Buyer"]
  end

  subgraph Device["Android phone"]
    App["AniSense app<br/>React + TypeScript in a Capacitor WebView"]
    Local["On-device storage<br/>cache, outbox, session, settings"]
  end

  subgraph Supabase["Supabase (managed)"]
    Auth["Auth"]
    DB["PostgreSQL<br/>tables, RLS, functions"]
    Storage["Storage<br/>listing photos"]
  end

  Web["Static web pages (docs/)<br/>privacy policy, account deletion"]

  subgraph Planned["Planned, not built yet"]
    SMS["SMS provider<br/>phone verification"]
    Prices["Price ingestion<br/>government sources"]
    Models["Forecast job<br/>ARIMA and LSTM"]
  end

  Farmer --> App
  Buyer --> App
  App <--> Local
  App <-->|HTTPS| Auth
  App <-->|HTTPS| DB
  App -->|HTTPS| Storage
  Web -->|HTTPS| Auth
  Web -->|HTTPS| DB
  Auth -.-> SMS
  Prices -.-> DB
  Models -.-> DB
```

There is no custom application server. The app talks to Supabase directly, and every rule that matters (who can read what, how an order is priced, how stock is reduced) is enforced inside the database.

## 2. Constraints that shaped the design

| Constraint | Consequence |
|---|---|
| Users are 50 to 70 years old, on budget Android phones | One codebase tuned for one platform; large type and targets; no gestures required; English and Tagalog. |
| Signal in the fields is unreliable | A farmer's own records work offline and sync later; prices are cached on the phone. |
| A small team and no operations budget | A managed backend with no server to run; business rules in SQL, next to the data. |
| The app must be demonstrable before the backend exists | A demo mode that runs entirely on bundled sample data. |
| The key shipped in the app is public | Security cannot depend on the client; Row Level Security on every table. |

## 3. Client architecture

### 3.1 Layers

```mermaid
flowchart TB
  Shell["App shell<br/>src/App.tsx"]
  Screens["Screens<br/>src/screens"]
  Components["Components<br/>src/components"]
  Store["Market store<br/>src/lib/market.tsx"]
  Services["Services<br/>src/services"]
  Lib["Infrastructure<br/>src/lib: cache, outbox, supabase, platform"]
  Data["Static data<br/>src/data"]

  Shell --> Screens --> Components
  Screens --> Store
  Shell --> Store
  Store --> Services --> Lib
  Store --> Data
  Components --> Data
```

| Layer | Location | Responsibility |
|---|---|---|
| App shell | `src/App.tsx` | Authentication state, which screen is showing, session restore, the walkthrough and achievement overlays. Injects the stylesheets. |
| Screens | `src/screens/` | One file per screen. Compose components and read from the store. |
| Components | `src/components/` | Reusable UI, grouped by feature (`home`, `analytics`, `profile`, `tour`, `ui`, `layout`). |
| Market store | `src/lib/market.tsx` | The single data layer. Holds listings, sellers, purchases, expenses, farm records, prices and badges, and exposes actions to change them. |
| Services | `src/services/` | One file per domain (`auth`, `listings`, `transactions`, `expenses`, `farmRecords`, `catalog`, `sync`). The only code that calls Supabase. |
| Infrastructure | `src/lib/` | Supabase client, cache, outbox, platform wrappers (haptics, status bar, keyboard). |
| Static data | `src/data/` | The crop catalog, Philippine locations, the privacy policy, and sample data for demo mode. |

**Dependency rule:** screens and components never import the Supabase client. They read and write through the store, which decides whether to call a service or use sample data. This keeps the live and demo modes from leaking into the UI.

### 3.2 Two modes

The store picks a mode from one condition: Supabase is configured **and** a real account is signed in.

| | Live | Demo |
|---|---|---|
| When | `.env` is present and an account is signed in | No `.env`, or the demo sign-in |
| Data source | Supabase | Bundled sample data in `src/data/` |
| Writes | Database (queued when offline, where supported) | Memory, with farm records kept on the phone |
| Purpose | Real use | Demonstrations and development without a backend |

### 3.3 State

State lives in React, with no external state library:

- **`App.tsx`** owns authentication and navigation state.
- **`MarketContext`** provides the market store to every screen.
- **`ViewerContext`** provides who is looking (role and location) to components that vary by role.
- **`LanguageProvider`** provides the language and the translation functions.

### 3.4 Navigation

Navigation is state, not URLs. There is no router, because the app has no addresses to share and runs inside a WebView.

```mermaid
stateDiagram-v2
  [*] --> Welcome
  Welcome --> Language
  Language --> Role
  Role --> SignIn: has an account
  Role --> SignUp: new
  SignUp --> SignUp: one question per page
  SignIn --> In
  SignUp --> In: account created

  state "Signed in" as In {
    [*] --> Home
    Home --> Prices
    Home --> Marketplace
    Home --> Expenses
    Home --> Profile
    Home --> Weather: pushed
    Home --> Analytics: pushed
    Home --> Guide: pushed
    Profile --> Privacy: pushed
  }
  In --> Welcome: sign out or delete account
```

- Before sign-in, an `authScreen` value steps through welcome, language, role and the account form.
- After sign-in, an `active` value selects the screen. The five tab screens switch in place; the others are pushed and return on Back.
- Android's hardware Back is handled by a small stack (`useHardwareBack`): the topmost open sheet closes first, then pushed screens, then the app.

### 3.5 Styling

Styles are plain CSS held in TypeScript strings (`src/styles/*.ts`) and injected with `<style>` tags. A shared token file defines color, type, radius, motion and spacing. This avoids a CSS toolchain and keeps each stylesheet next to the rationale in its comments.

### 3.6 Localization

Every interface string is an entry in `src/i18n.tsx` with English and Tagalog text. Components call `t(key)` for strings and `tn(name)` for crop names. A few market terms stay in English by design. The privacy policy (`src/data/privacyPolicy.ts`) is English only and is never translated.

## 4. Backend architecture

Supabase provides four things:

| Service | Use |
|---|---|
| Auth | Accounts and sessions. A mobile-number account is stored as an email alias until SMS verification is added. |
| PostgreSQL | 16 tables in five sections: catalog, accounts, market, farm records, rewards. |
| Functions (PL/pgSQL) | Operations that must be atomic or must not trust the client. |
| Storage | One public bucket for listing photos, written only by the owner. |

Server-side functions:

| Function | Why it runs on the server |
|---|---|
| `handle_new_user` | Creates the profile and crop list when an account is created. |
| `place_order` | Locks the listings, checks stock, takes the price from the listing, writes the order and reduces stock, all in one transaction. |
| `replace_my_sales`, `replace_my_plantings`, `replace_my_price_alerts`, `replace_my_harvest_plans` | Replace one of a farmer's lists in a single step, which makes offline sync idempotent. |
| `set_my_crops` | Replaces the crops a farmer grows. |
| `delete_my_account` | Deletes the caller's own account; takes no argument, so it cannot target anyone else. |
| Award triggers | Grant badges when a profile, first listing or first sale appears. |

The full table and relationship reference is in [supabase/README.md](supabase/README.md).

## 5. Key flows

### 5.1 Creating an account

Sign-up collects answers across several pages but creates the account once, at the end. An account created on the first page would be left without a town or crops if the user stopped halfway.

```mermaid
sequenceDiagram
  actor U as User
  participant A as App
  participant Auth as Supabase Auth
  participant DB as PostgreSQL

  U->>A: Answers each question
  Note over A: Answers held in memory only
  U->>A: Create Account
  A->>Auth: signUp(email or alias, password, details)
  Auth->>DB: insert auth.users
  DB->>DB: handle_new_user trigger: profile, crops, first badge
  Auth-->>A: session
  A->>DB: load profile and market data
  A-->>U: Welcome ID, then walkthrough
```

### 5.2 Checkout

```mermaid
sequenceDiagram
  actor B as Buyer
  participant A as App
  participant DB as PostgreSQL

  B->>A: Confirm Order
  A->>DB: rpc place_order(items)
  DB->>DB: lock listings
  DB->>DB: check stock, read price from listing
  alt enough stock
    DB->>DB: insert order and lines, reduce stock
    DB-->>A: order id
    A-->>B: Receipt
  else not enough
    DB-->>A: NOT_ENOUGH (nothing written)
    A-->>B: "A farmer has less left than you asked for"
  end
```

The client sends only listing ids and quantities. Price and seller are read on the server, so a modified client cannot change what it pays.

### 5.3 Reading data

Every read goes through `cachedFetch`: a successful response is saved on the phone, and a failed one falls back to the saved copy.

```mermaid
sequenceDiagram
  participant S as Store
  participant Sv as Service
  participant C as Cache
  participant DB as Supabase

  S->>Sv: fetch
  Sv->>DB: query
  alt online
    DB-->>Sv: rows
    Sv->>C: save
    Sv-->>S: data (fresh)
  else offline
    Sv->>C: read
    C-->>Sv: saved copy
    Sv-->>S: data (from cache, with its date)
  end
```

### 5.4 Writing while offline

```mermaid
sequenceDiagram
  actor F as Farmer
  participant S as Store
  participant O as Outbox
  participant DB as Supabase

  F->>S: Add expense (no signal)
  S->>O: enqueue
  S-->>F: Shown at once
  Note over O: Waits on the phone
  Note over S: Connection returns, or the account opens
  S->>O: syncNow()
  O->>DB: replay in order
  DB-->>O: real ids
  O->>O: map temporary ids to real ones
  S->>DB: fetch the fresh list
```

### 5.5 Deleting an account

```mermaid
sequenceDiagram
  actor U as User
  participant A as App
  participant St as Storage
  participant DB as PostgreSQL

  U->>A: Confirm delete
  A->>St: remove own photos
  A->>DB: rpc delete_my_account()
  DB->>DB: delete auth.users row
  DB->>DB: cascade: profile, listings, records, badges
  DB->>DB: orders kept, name fields set to null
  A->>A: clear this account's cache and outbox
  A-->>U: Welcome screen
```

The same function is called by the web page in `docs/`, for someone who no longer has the app.

## 6. Offline design

| Mechanism | File | Role |
|---|---|---|
| Cache | `src/lib/cache.ts` | Saves each successful read; serves it when the network fails. |
| Outbox | `src/lib/outbox.ts` | Queues writes made offline, in order. |
| Sync | `src/services/sync.ts` | Replays the outbox when an account opens or the connection returns. |

Design points:

- **Storage.** Both use Capacitor Preferences, which is native storage on Android. WebView `localStorage` can be cleared by the system under storage pressure.
- **Scoped per account.** Every cache key and queued operation carries the account id, so two accounts on one phone never see or send each other's data.
- **Idempotent sync.** Farm-record lists are saved by replacing the whole list on the server, so replaying an operation twice is harmless.
- **Deliberately online-only.** Posting a listing and checkout need the server because they involve other people's stock. The app says so plainly instead of queuing them.

## 7. Security

- **Row Level Security on every table.** Access is decided by the database from the signed-in user's id.
- **Least exposure.** Farmer profiles are visible to signed-in users, because buyers must find them. A buyer's details are visible only to farmers that buyer has ordered from. Farm records are visible only to their owner.
- **Column-level grants.** Users can update their own name, phone, location and bio, but not their rating or sales count.
- **Server-side operations.** Orders can be created only through `place_order`.
- **No secrets in the client.** The app and the web pages use the publishable key only. `npm run check:db` refuses to run if it finds a secret key in `.env`.
- **Passwords** are handled by Supabase Auth and stored hashed.
- **Transport** is HTTPS throughout.

## 8. Build and delivery

```mermaid
flowchart LR
  Src["src/"] -->|tsc + vite build| Dist["dist/"]
  Dist -->|cap sync| AndroidProj["android/"]
  AndroidProj -->|gradle assemble| APK["APK"]
  Env[".env"] -.->|baked in at build| Dist
  Policy["src/data/privacyPolicy.ts"] -->|build-privacy.mjs| DocsPage["docs/privacy-policy.html"]
  Crops["src/data/crops.ts"] -->|build-seed.mjs| Seed["supabase/seed.sql"]
  Csv["data/historical-prices.csv"] -->|build-prices.mjs| History["src/data/priceHistory.ts"]
  Csv -->|ml/train_forecasts.py| Forecasts["src/data/forecasts.json"]
  History -->|build-seed.mjs| Seed
  Forecasts -->|build-seed.mjs| Seed
  History -.->|bundled| Dist
  Forecasts -.->|bundled| Dist
```

- Environment values are compiled into the bundle, so a build made without `.env` is a demo build.
- Generators keep derived files in step with their source: the database seed is generated from the crop catalog, the price records and the forecasts, and the web privacy policy from the text the app shows.
- Prices follow one path: `data/historical-prices.csv` holds the monthly records. From it come the history the app bundles (so prices show offline), the ARIMA and LSTM forecasts (trained locally in Python, never on the phone), and the database's copy. Signed in, the app lays the database's records and forecasts over the bundled ones, so a new month reaches phones without a new APK.
- `docs/` is a static site (privacy policy and account deletion) that can be served by any static host.

## 9. Decision log

| Decision | Alternatives considered | Reason |
|---|---|---|
| Supabase as the backend | Firebase, a custom server | Relational data (orders, stock, records) fits SQL; Row Level Security and SQL functions keep rules next to the data; standard PostgreSQL avoids lock-in. |
| Capacitor around a web app | Native Android, React Native, Flutter | One codebase and the fastest iteration; the app needs little native capability. |
| No router | React Router | No shareable URLs inside a WebView; two small pieces of state are simpler. |
| No state library | Redux, Zustand | One store and two small contexts cover the app. |
| CSS in TypeScript strings | Tailwind, CSS modules | No extra toolchain; design tokens and rationale live with the styles. |
| Business rules in SQL functions | Rules in the client or in server functions elsewhere | The client is untrusted; a single transaction is needed for checkout. |
| Mobile-number accounts as an email alias | Supabase phone auth from day one | Phone auth needs a paid SMS provider; the alias can be migrated later without users losing their login. |
| Create the account at the last sign-up step | Create on the first page | Avoids half-complete accounts. |
| Keep orders when an account is deleted, with the name removed | Delete orders with the account | An order is also the other party's record of a sale. |
| One source for the privacy policy | Separate app and web copies | The two can never disagree. |

## 10. Known limitations and planned work

| Area | Current state | Plan |
|---|---|---|
| Crop prices | Monthly records for five varieties, added to a CSV by hand; sample values for the other 19 | Records for the remaining varieties; ingestion from government sources on a schedule. |
| Price forecasts | Fixed sample values in `src/data/forecast.ts` | Train ARIMA and LSTM models offline on historical prices and store their output in the database; the app only reads results, so it keeps working offline. |
| Weather | Sample values in `src/data/weather.ts` | Connect a forecast service. |
| Phone verification | Not enabled | SMS codes through a provider, sent by a server-side hook. |
| Password reset | Not implemented | Email reset for Gmail accounts; SMS code for mobile-number accounts. |
| Automated tests | None in the repository | Add unit tests for the services and the store, and database tests for the SQL functions. |
| Continuous integration | None | Type-check and build on every push. |
| iOS | Not targeted | Capacitor supports it if needed later. |
