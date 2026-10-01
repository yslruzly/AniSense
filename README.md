# AniSense

**Ani mo, alam mo.** A mobile app that gives farmers in Nueva Ecija, Philippines, the day's crop prices, a direct marketplace, expense and profit tracking, and weather for fieldwork, and lets buyers anywhere in the country buy straight from those farmers.

![Platform](https://img.shields.io/badge/platform-Android%207.0%2B-3DDC84)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E)

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Project status](#project-status)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Database](#database)
- [Building the Android app](#building-the-android-app)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Offline behavior](#offline-behavior)
- [Security](#security)
- [Localization and accessibility](#localization-and-accessibility)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

Farmers often sell without knowing the day's market price, and buyers rarely reach farmers directly. AniSense puts both on one app:

- **Farmers** see the latest prices for their crops, post harvests for sale, record expenses and sales, and check the weather before fieldwork.
- **Buyers** browse fresh harvests, compare them against market prices, and order directly from the farmer who grew them.

The app is designed for users aged 50 to 70 on budget Android phones: text is 16px or larger, every control is at least 52px tall, the interface is available in English and Tagalog, and the core screens keep working without a signal.

## Features

### For farmers

| Feature | Description |
|---|---|
| Prices | Monthly retail prices with the change from the month before. Five varieties (Special Rice, Well Milled Rice, Red Onion, Native Garlic, Calamansi) come from the study's records, 2021 to 2026, with a 12-month history. |
| Marketplace | Post a harvest with a photo, price and quantity; edit or remove it; see who ordered. |
| Expenses and profit | Record costs by category and crop, record sales, and see estimated and final profit. |
| Crop tracker | Log plantings and count down to harvest. |
| Price alerts | Set a target price for a crop and get notified in the app when it is reached. |
| Price outlook | Sell-now-or-wait advice and a 7-day price chart per crop. See [Project status](#project-status). |
| Weather | Current conditions, hourly and 5-day outlook, and the best window for fieldwork. See [Project status](#project-status). |
| Achievements | Badges for joining, a first listing, a first sale, and Farmer of the Week, Month and Year. |

### For buyers

| Feature | Description |
|---|---|
| Home | Fresh listings, the cheapest crops today, featured farmers, and past purchases. |
| Marketplace | Filter by crop, variety or family; search by crop, farmer or town; sort by price or date. |
| Checkout | Add to cart and place an order. Stock is checked and reduced atomically on the server. |
| Receipt | A shareable order receipt. |
| Farmer profiles | Rating, years of experience, location and what each farmer grows. |

### Shared

- Sign up and sign in with a mobile number or Gmail address, as a farmer or a buyer.
- Conversational sign-up: one question per screen, with a progress bar.
- A guided first-run walkthrough, replayable from the in-app guide.
- A member ID card generated at sign-up.
- English and Tagalog throughout.

## Project status

The app is feature-complete on the client. Some data sources are still sample data and are listed here so nobody mistakes them for live figures.

| Area | Status |
|---|---|
| Accounts, profiles, listings, orders, expenses, farm records, achievements | Live on Supabase once a project is configured. |
| Demo mode | Without a `.env` file the app runs on built-in sample data, so a build without keys still works for demonstrations. |
| Crop prices | **Real monthly retail prices** for the study's five varieties (`data/historical-prices.csv`, January 2021 to September 2026), bundled in the app and loaded into the database by the seed file. The other 19 varieties still show **sample values**. |
| Price forecasts (ARIMA, LSTM) | Trained on the price records by `ml/train_forecasts.py` (statsmodels and PyTorch, run locally, free). Three months ahead for the five varieties, each with its tested error; results in `ml/REPORT.md`. |
| Weather | **Sample values.** No forecast service is connected yet. |
| Account deletion | In the app (Profile) and on a web page (`docs/delete-account.html`), as Google Play requires. |
| Mobile-number verification by SMS | Not enabled. Numbers are not verified. |
| Password reset | Not implemented. |
| Automated tests | None yet. `npm run build` type-checks the project. |

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 18, TypeScript 5 |
| Build | Vite 5 |
| Native shell | Capacitor 8 (Android) |
| Backend | Supabase: PostgreSQL, Auth, Storage, Row Level Security, PL/pgSQL functions |
| Icons | lucide-react |
| Styling | CSS-in-TypeScript stylesheets with shared design tokens |
| Image tooling | sharp (development only) |

Capacitor plugins in use: App, Filesystem, Haptics, Keyboard, Preferences, Share, Splash Screen, Status Bar.

## Architecture

```mermaid
flowchart LR
  subgraph Phone["Android app (Capacitor WebView)"]
    UI["Screens and components<br/>React + TypeScript"]
    Store["Market store<br/>src/lib/market.tsx"]
    Services["Services<br/>src/services/*"]
    Cache["On-device cache<br/>src/lib/cache.ts"]
    Outbox["Outbox for offline writes<br/>src/lib/outbox.ts"]
  end

  subgraph Supabase
    Auth["Auth"]
    DB["PostgreSQL<br/>16 tables, RLS on all"]
    RPC["Functions<br/>place_order, replace_my_*"]
    Storage["Storage<br/>listing-photos"]
  end

  UI --> Store --> Services
  Services <--> Cache
  Services --> Outbox
  Services <--> Auth
  Services <--> DB
  Services --> RPC
  Services --> Storage
  Outbox -. "syncs when online" .-> RPC
```

Key design decisions:

- **One data layer.** Screens read and write through the market store (`src/lib/market.tsx`). It serves live data when Supabase is configured and sample data otherwise, so screens never branch on the mode.
- **The database enforces the rules.** Row Level Security is enabled on every table. Checkout runs in a single server function (`place_order`) that takes the price from the listing and refuses to oversell.
- **Offline first for a farmer's own records.** Reads are cached per account; writes made offline wait in an outbox and sync when the connection returns.
- **No client-side secrets.** The app ships only the publishable key.

## Getting started

### Prerequisites

| Tool | Version | Needed for |
|---|---|---|
| Node.js | 22 or newer | Development and builds |
| npm | 10 or newer | Dependencies |
| JDK | 21 | Android builds |
| Android Studio and Android SDK | SDK Platform 36 | Android builds and emulators |
| Supabase account | Free tier | Live data (optional for demo mode) |


## License

This repository does not yet include a license. Until one is added, all rights are reserved by the author.

---

Maintained by [@yslruzly](https://github.com/yslruzly).
