# SokaKing Dynamic Tags & Shortcodes Guide

This document details all supported dynamic shortcodes and tags across SokaKing markdown content, SEO templates, crawler HTML injection, and prediction pages.

---

## 1. Today's Fixtures & Prediction Tags

These tags dynamically pull from the current day's live fixtures and market predictions (`/api/predictions?category=today`).

| Tag Name | Aliases | Output Syntax | Example Output |
| :--- | :--- | :--- | :--- |
| **Top Marquee Fixtures** | `{{TODAY_TOP_FIXTURES}}`<br>`{{TODAY_TOP_TWO_FIXTURES}}`<br>`{{TOP_TWO_TODAY_FIXTURES}}`<br>`{{TOP_TODAY_FIXTURES}}` | `fixture (tip) and fixture (tip)` | `Arsenal vs Chelsea (1X) in English Premier League and Real Madrid vs Barcelona (1) in Spanish La Liga` |
| **Today's Leagues** | `{{TODAY_LEAGUES}}`<br>`{{TODAY_LEAGUE_NAMES}}`<br>`{{TODAY_FIXTURES_LEAGUES}}` | `league, league, league and league` | `English Premier League, Spanish La Liga, Italian Serie A, German Bundesliga and UEFA Champions League` |
| **Market Predictions Summary** | `{{TODAY_PREDICTIONS}}`<br>`{{TODAY_PREDICTIONS_SUMMARY}}`<br>`{{TODAY_PREDICTION_SUMMARY}}` | `count category, count category and count category` | `3 ov 2.5, 1 double chance and 1 home win` |
| **Predictions Total Count** | `{{TODAY_PREDICTIONS_COUNT}}`<br>`{{TODAY_COUNT}}`<br>`{{TODAY_FIXTURES_COUNT}}` | Integer string | `5` |

### Syntax Styles
All tags can be written in any of three interchangeable syntaxes:
- **Mustache / Liquid Style**: `{{TODAY_TOP_FIXTURES}}`
- **HTML Comment Style**: `<!-- TODAY_TOP_FIXTURES -->`
- **Square Bracket Style**: `[TODAY_TOP_FIXTURES]`

---

## 2. Formatting & Standardization Rules

### 2.1 Marquee Fixture Tips (`{{TODAY_TOP_FIXTURES}}`)
- Normalized from prediction data to extract clean tip notation.
- If raw prediction is `Double Chance (1X)`, the tag outputs `(1X)`.
- If raw prediction is `Home Win (1)`, the tag outputs `(1)`.
- If raw prediction is `Over 2.5` or `OV 2.5`, it outputs `(OV 2.5)`.
- Automatically appends the competition using `in <League>` (e.g. `in English Premier League`).

### 2.2 League Names (`{{TODAY_LEAGUES}}`)
- Deduplicates leagues represented across the day's matches.
- Joins leagues with commas and a natural final `and` (no trailing commas).
- If no fixtures are loaded, defaults gracefully to `All Major Leagues`.

### 2.3 Market Distribution Categories (`{{TODAY_PREDICTIONS}}`)
- Uses normalized database prediction tokens for market distribution:
  - `ov 2.5` (Over 2.5 Goals)
  - `ov 1.5` (Over 1.5 Goals)
  - `un 2.5` (Under 2.5 Goals)
  - `un 1.5` (Under 1.5 Goals)
  - `double chance` (1X, X2, 12, DC)
  - `home win` (1)
  - `away win` (2)
  - `draw` (X)
  - `BTTS` (Both Teams to Score)
- Pluralization and count formatting: `1 double chance`, `2 double chance`, `3 ov 2.5`.

### 2.4 Calculated Prediction vs. Fixture Tags
- **In Match Feed**: The **Calculated Prediction** displays the exact database prediction value (e.g. `OV 2.5`, `OV 1.5`, `1X`, `1`).
- **Fixture Badges**: Visual tag badges display categorized readable labels (`3+ Goals`, `2+ Goals`, `Double Chance`, etc.).

---

## 3. Jackpot Coupon Tags

For weekly or midweek jackpots (`sportpesa-mega`, `betika-midweek`, `mozzart-grand`, etc.):

| Category | Tag Examples | Description |
| :--- | :--- | :--- |
| **Schedule / Dates** | `{{JACKPOT_SCHEDULE}}`<br>`{{MEGA_JACKPOT_SCHEDULE}}` | Formatted kickoff time window in East Africa Time (EAT, UTC+3) |
| **Leagues** | `{{JACKPOT_LEAGUES}}`<br>`{{BETIKA_MIDWEEK_LEAGUES}}` | Extracted league list with grammar articles ("the Premier League") |
| **Selections Starter** | `{{JACKPOT_SELECTIONS_INCLUDE}}` | `selections include 6 home wins, 2 draws, 5 away wins and 4 double chances` |
| **Selections Breakdown** | `{{JACKPOT_SELECTIONS}}` | `6 home wins, 2 draws, 5 away wins and 4 double chances` |
| **Upset Alerts** | `{{JACKPOT_UPSET_ALERT}}` | High-variance fixture alerts with double chance recommendations |
| **Sub-Jackpots / Tiers** | `{{JACKPOT_SUB_COMBOS:list}}`<br>`{{JACKPOT_SUB_COMBOS}}` | Combination prize breakdowns (list or paragraph format) |
| **Double Chance Fixtures** | `{{DOUBLE_CHANCE_FIXTURES:4}}` | Top N tactical double chance matches with explanations |
| **Top Confidence Fixtures** | `{{TOP_CONFIDENCE_FIXTURES:5}}` | Top N highest-probability match recommendations |
| **Full Fixtures Table** | `{{ALL_JACKPOT_FIXTURES}}` | Complete coupon match table with odds, tips, and probabilities |
| **Countdown Timer** | `{{UI_TIMER}}` | Live ticking countdown to the first kickoff |

---

## 4. Pipeline & Synchronization Architecture

1. **Client-Side Rendering (`MarkdownRenderer.tsx`)**:
   - Dynamically inspects content for `TODAY_` tags.
   - Triggers proactive fetch to `/api/predictions?category=today` if cache is cold.
   - Re-renders instantly upon live data arrival.

2. **Category Page Integration (`CategoryPredictionsPage.tsx`)**:
   - Injects active category fixtures directly into `MarkdownRenderer`.
   - Synchronizes `setLiveTodayFixturesCache(fixtures)` on initial mount and route change.

3. **Server-Side SEO Injection (`server.ts` & `htmlInjector.ts`)**:
   - Replaces all dynamic tags in `<title>`, `<meta name="description">`, OpenGraph tags, and crawler HTML bodies before serving crawler requests.
