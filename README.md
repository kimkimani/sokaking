# SokaKing - Dynamic Jackpot Shortcodes & Tags Documentation

This document provides complete documentation for the **Dynamic Jackpot Shortcode & Tagging System** used across SokaKing markdown pages, blog posts, and prediction guides.

---

## 1. Overview

The dynamic shortcode engine allows editors and writers to insert smart tags into markdown content. These tags automatically resolve to:
- Real kickoff dates/times adjusted for East Africa Time (EAT, UTC+3)
- League name collections formatted with natural English grammar and proper articles
- Computer model outcome distributions (home wins, draws, away wins)
- Analytical upset alerts pinpointing high-variance fixtures and double-chance recommendations
- Prize tiers, sub-jackpot combinations, and bonus payout structures
- Top confidence fixtures and low-risk double chance coverage cards

Tags can be **jackpot-specific** (e.g., `{{BETIKA_MIDWEEK_UPSET_ALERT}}`) or **generic** (e.g., `{{JACKPOT_UPSET_ALERT}}`), where generic tags automatically inherit the `jackpotId` specified in the page frontmatter.

---

## 2. Supported Jackpots (8 Active Jackpots)

The system actively supports all 8 primary jackpots available in Kenya:

| Jackpot ID | Display Name | Matches | Stake | Default Prefixes |
| :--- | :--- | :---: | :---: | :--- |
| `sportpesa-mega` | SportPesa Mega Jackpot Pro | 17 | KSh 99 | `MEGA_JACKPOT_`, `SPORTPESA_MEGA_`, `MEGA_` |
| `betika-midweek` | Betika Midweek Jackpot | 15 | KSh 15 | `BETIKA_MIDWEEK_`, `BETIKA_` |
| `mozzart-grand` | Mozzart Super Grand Jackpot | 20 | KSh 50 | `MOZZART_GRAND_`, `MOZZART_` |
| `sportpesa-midweek` | SportPesa Midweek Jackpot | 13 | KSh 99 | `SPORTPESA_MIDWEEK_`, `SP_MIDWEEK_`, `MIDWEEK_` |
| `mozzart-super-daily` | Mozzart Super Daily Jackpot | 16 | KSh 20 | `MOZZART_SUPER_DAILY_`, `SUPER_DAILY_`, `MOZZART_DAILY_` |

*Note: You can also use the generic prefix `JACKPOT_` on any page with a `jackpotId` declared in its frontmatter, or pass `jackpot="<id>"` inside any tag.*

---

## 3. Supported Syntaxes

All tags can be written in three interchangeable styles:

1. **Mustache / Liquid Style** (Recommended):
   ```markdown
   {{MEGA_JACKPOT_SCHEDULE}}
   {{JACKPOT_UPSET_ALERT}}
   ```
2. **HTML Comment Style** (Clean in raw markdown viewers):
   ```markdown
   <!-- MEGA_JACKPOT_SCHEDULE -->
   <!-- JACKPOT_UPSET_ALERT -->
   ```
3. **Square Bracket Style**:
   ```markdown
   [MEGA_JACKPOT_SCHEDULE]
   [JACKPOT_UPSET_ALERT]
   ```

---

## 4. Tag Reference & Output Examples

### 4.1 Schedule & Dates (`DATES` / `SCHEDULE`)
Calculates the kickoff window for the coupon matches and applies **+3 hours (EAT / UTC+3)** automatically.

- **Tags:**
  - `{{MEGA_JACKPOT_SCHEDULE}}` or `{{MEGA_JACKPOT_DATES}}`
  - `{{BETIKA_MIDWEEK_SCHEDULE}}`
  - `{{MOZZART_GRAND_SCHEDULE}}`
  - `{{JACKPOT_SCHEDULE}}` *(Resolves to current page jackpot)*
- **Example Output:**
  > `Saturday, September 12, from 19:00, with the remaining fixtures continuing throughout Sunday, September 13`
  > *(Or single-day coupons: `Friday, September 19, from 20:00`)*

---

### 4.2 League Names (`LEAGUES` / `LEAGUE_NAMES`)
Extracts unique leagues represented in the coupon, prepends definite articles ("the") to leagues where appropriate (e.g., *the Premier League*, *the Bundesliga*), and formats with natural English punctuation.

- **Tags:**
  - `{{MEGA_JACKPOT_LEAGUES}}`
  - `{{BETIKA_MIDWEEK_LEAGUES}}`
  - `{{JACKPOT_LEAGUES}}`
- **Example Output (SportPesa Mega):**
  > `Serie A, Ligue 1, Serie B, La Liga, the Premier League, Jupiler Pro League, Primeira Liga, Süper Lig, Superliga and Eliteserien`
- **Example Output (Betika Midweek):**
  > `the Bundesliga, the Premier League, Serie A and Ligue 1`

---

### 4.3 Selections Include (`SELECTIONS_INCLUDE`)
Generates the natural language sentence starter with prediction counts, including home wins, draws, away wins, and total double chances.

- **Tags:**
  - `{{MEGA_JACKPOT_SELECTIONS_INCLUDE}}`
  - `{{BETIKA_MIDWEEK_SELECTIONS_INCLUDE}}`
  - `{{JACKPOT_SELECTIONS_INCLUDE}}`
- **Example Output (SportPesa Mega - 17 matches):**
  > `selections include 6 home wins, 2 draws, 5 away wins and 4 double chances`
- **Example Output (Betika Midweek - 15 matches):**
  > `selections include 1 home win, 1 draw, 8 away wins and 5 double chances`

> **Note on Mathematical Accuracy**: Every fixture is counted strictly once (as a straight home win, straight draw, straight away win, or double chance coverage). The sum of all counts (`home + draws + away + double chances`) always equals the total number of games available on the coupon (e.g. 6 + 2 + 5 + 4 = 17).

---

### 4.4 Outcome Distribution (`SELECTIONS` / `OUTCOMES` / `DISTRIBUTION`)
Calculates the numerical breakdown of home wins, draws, away wins, and total double chances without the "selections include" prefix.

- **Tags:**
  - `{{MEGA_JACKPOT_SELECTIONS}}`
  - `{{BETIKA_MIDWEEK_SELECTIONS}}`
  - `{{JACKPOT_SELECTIONS}}`
  - `{{JACKPOT_DOUBLE_CHANCES_COUNT}}` *(Standalone count: e.g. `4 double chances` or `4` with `:short`)*
- **Example Output (SportPesa Mega):**
  > `6 home wins, 2 draws, 5 away wins and 4 double chances`

---

### 4.5 Upset Alerts (`UPSET_ALERT` / `UPSETS`)
Analyzes coupon fixtures to locate tight head-to-head margins, low-confidence fixtures, or draws, and provides specific double-chance tactical recommendations.

- **Tags:**
  - `{{MEGA_JACKPOT_UPSET_ALERT}}`
  - `{{BETIKA_MIDWEEK_UPSET_ALERT}}`
  - `{{JACKPOT_UPSET_ALERT}}`
- **Example Output (SportPesa Mega):**
  > `St Johnstone vs Hibernian (Scottish Premiership) and Espanyol vs Sevilla (La Liga) represent this weekend's primary upset alerts, where narrow head-to-head margins and unpredictable away form make double chance coverage (X2 or 1X) highly advisable.`
- **Example Output (Betika Midweek):**
  > `Sassuolo vs Udinese (Serie A) and 1. FC Heidenheim vs FC Augsburg (the Bundesliga) represent this round's key upset alerts, where narrow margins make double chance coverage (1X or X2 and X2) essential.`

---

### 4.6 Sub-Jackpots & Bonus Tiers (`SUB_COMBOS` / `COMBOS` / `BONUSES` / `TIERS`)
Provides official bonus payouts and sub-combination tier details. Supports format modifiers: `:paragraph` (default), `:list`, or `:short`.

- **Tags:**
  - Full Paragraph: `{{MEGA_JACKPOT_SUB_COMBOS}}` or `{{BETIKA_MIDWEEK_SUB_COMBOS}}`
  - Bulleted List: `{{MEGA_JACKPOT_SUB_COMBOS:list}}` or `{{BETIKA_MIDWEEK_SUB_COMBOS:list}}`
  - Short Inline Phrase: `{{MEGA_JACKPOT_SUB_COMBOS:short}}`
  - Generic: `{{JACKPOT_SUB_COMBOS:list}}`
- **Example Output (Paragraph Format - SportPesa Mega):**
  > `SportPesa Mega Jackpot Pro offers five distinct combination tiers from the same 17-game coupon at KSh 99 per line: the full 17-match jackpot, the 16-game sub-jackpot (matches 2–17), the 15-game sub-jackpot (matches 3–17), the 14-game sub-jackpot (matches 4–17), and the 13-game sub-jackpot (matches 5–17), each featuring standalone guaranteed jackpots and cash bonuses.`
- **Example Output (List Format - Mozzart Grand):**
  > - **20/20 Grand Prize**: KSh 200,000,000 fixed cash jackpot
  > - **19/20 Bonus Tier**: Significant cash payout bonus
  > - **18/20 Bonus Tier**: Substantial consolation bonus
  > - **17/20 Bonus Tier**: Entry-level cash bonus tier
  > - **0/20 Unique Prize**: Consolation reward for getting zero predictions correct

---

### 4.7 Double Chance Fixtures (`DOUBLE_CHANCE_FIXTURES` / `DOUBLE_CHANCES`)
Generates high-probability double chance fixture analysis cards with tactical rationales.

- **Tags:**
  - `{{MEGA_JACKPOT_DOUBLE_CHANCE_FIXTURES}}` (Defaults to 4 fixtures)
  - `{{BETIKA_MIDWEEK_DOUBLE_CHANCE_FIXTURES:3}}` (Custom count)
  - `{{DOUBLE_CHANCE_FIXTURES count=5}}`
- **Example Output:**
  ```markdown
  FC St. Pauli vs Bayer Leverkusen — DC2X
  away (Bayer Leverkusen) to win or match to end draw

  Leeds vs Bournemouth — DCX2
  Any team to win. The match is predicted to end as a double chance with Home or away Win
  ```

---

### 4.8 Top Confidence Fixtures (`TOP_CONFIDENCE_FIXTURES` / `TOP_FIXTURES`)
Generates ranked tables of the fixtures with the highest statistical model confidence scores.

- **Tags:**
  - `{{TOP_MEGA_JACKPOT_FIXTURES}}` (Defaults to 7 fixtures)
  - `{{TOP_CONFIDENCE_FIXTURES:5}}` (Top 5 matches)
  - `{{TOP_BETIKA_MIDWEEK_FIXTURES:5}}`
  - `{{TOP_CONFIDENCE_FIXTURES count=6 jackpot="mozzart-grand"}}`

---

### 4.9 Today's Fixtures & Prediction Highlights Tags
Generates dynamic tags for today's live daily fixtures, top marquee matches, league roundups, and market prediction distributions. These tags dynamically synchronize with the live today predictions database API (`/api/predictions?category=today`).

- **Top Two Marquee Fixtures (`TODAY_TOP_FIXTURES` / `TODAY_TOP_TWO_FIXTURES` / `TOP_TWO_TODAY_FIXTURES` / `TOP_TODAY_FIXTURES`):**
  - **Tags:** `{{TODAY_TOP_FIXTURES}}`, `{{TODAY_TOP_TWO_FIXTURES}}`, `{{TOP_TWO_TODAY_FIXTURES}}`, `{{TOP_TODAY_FIXTURES}}`
  - **Syntax:** `fixture (tip) and fixture (tip)`
  - **Behavior:** Selects the top 2 highest-confidence matches scheduled for today. Normalizes prediction text to extract the concise tip notation (e.g. `1X`, `1`, `OV 2.5`) and attaches the league name with natural prepositions (`in English Premier League`).
  - **Example Output:**
    > `Arsenal vs Chelsea (1X) in English Premier League and Real Madrid vs Barcelona (1) in Spanish La Liga`

- **Today's Leagues Roundup (`TODAY_LEAGUES` / `TODAY_LEAGUE_NAMES` / `TODAY_FIXTURES_LEAGUES`):**
  - **Tags:** `{{TODAY_LEAGUES}}`, `{{TODAY_LEAGUE_NAMES}}`, `{{TODAY_FIXTURES_LEAGUES}}`
  - **Syntax:** `league, league, league and league`
  - **Behavior:** Collects unique leagues across all today fixtures and formats them using natural English list punctuation (Oxford comma omitted with final `and`).
  - **Example Output:**
    > `English Premier League, Spanish La Liga, Italian Serie A, German Bundesliga and UEFA Champions League`

- **Today's Market Predictions Distribution (`TODAY_PREDICTIONS` / `TODAY_PREDICTIONS_SUMMARY`):**
  - **Tags:** `{{TODAY_PREDICTIONS}}`, `{{TODAY_PREDICTIONS_SUMMARY}}`, `{{TODAY_PREDICTION_SUMMARY}}`
  - **Syntax:** `count category, count category and count category`
  - **Behavior:** Aggregates market counts using standard database market values (`ov 2.5`, `double chance`, `home win`, `ov 1.5`, `away win`, `draw`, `BTTS`).
  - **Example Output:**
    > `3 ov 2.5, 1 double chance and 1 home win`

- **Today's Predictions Total Count (`TODAY_PREDICTIONS_COUNT`):**
  - **Tags:** `{{TODAY_PREDICTIONS_COUNT}}`, `{{TODAY_COUNT}}`, `{{TODAY_FIXTURES_COUNT}}`
  - **Syntax:** Pure integer count string of today's available match predictions.
  - **Example Output:**
    > `5`

- **Data Consistency & Prediction Display Standards:**
  - **Calculated Prediction vs. Fixture Badges**: In the predictions list feed, the actual calculated tip reflects the raw database value (e.g. `OV 2.5`, `OV 1.5`, `1X`), while the visual badge pills display human-friendly category tags (e.g. `3+ Goals`, `2+ Goals`, `Double Chance`).
  - **Live Synchronization**: Module-level caching (`todayFixturesTags.ts`) caches API results with automatic fallback to client-side state and instant reactive re-renders across `MarkdownRenderer` and SSR HTML injection.

---

### 4.10 Granular Jackpot Date & Time Tags
In addition to the full schedule sentence, you can output precise kickoff and closing timestamps:

- **Kickoff Start Date & Time:**
  - `{{START_DATE}}`, `{{KICKOFF_DATE}}` *(e.g. Saturday, 18 September)*
  - `{{START_TIME}}`, `{{KICKOFF_TIME}}` *(e.g. 16:00 EAT)*
  - `{{START_DATETIME}}` *(e.g. Saturday, 18 September at 16:00 EAT)*
- **Jackpot Closing / Final Fixture Date & Time:**
  - `{{END_DATE}}`, `{{CLOSING_DATE}}` *(e.g. Sunday, 19 September)*
  - `{{END_TIME}}` *(e.g. 22:45 EAT)*
  - `{{END_DATETIME}}` *(e.g. Sunday, 19 September at 22:45 EAT)*

---

### 4.11 Full Fixtures Grid & Interactive Widgets
- **Complete Coupon Predictions Table (`ALL_JACKPOT_FIXTURES`):**
  - **Tags:** `{{ALL_MEGA_JACKPOT_FIXTURES}}`, `{{ALL_JACKPOT_FIXTURES}}`, `{{MEGA_JACKPOT_ALL_FIXTURES}}`, `{{ALL_PREDICTIONS}}`
  - **Renders:** Full 17/15/20 match table complete with kickoff times, teams, probabilities, model tips, and odds.
- **Live Countdown Timer Widget (`UI_TIMER`):**
  - **Tags:** `{{UI_TIMER}}`, `{{JACKPOT_TIMER}}`, `{{COUNTDOWN_TIMER}}`, `{{COUNTDOWN}}`
  - **Renders:** Interactive live countdown clock ticking down to the first match kickoff.

---

### 4.12 Markdown Article Frontmatter Tags
Every article and markdown page supports structured metadata in YAML frontmatter:

```yaml
---
title: "How to Win the SportPesa Mega Jackpot: 7 Proven Mathematical Strategies"
displayTitle: "How to Win the SportPesa Mega Jackpot: 7 Proven Mathematical Strategies"
description: "Master the mathematics of the 17-game SportPesa Mega Jackpot with Poisson distribution models, double chance optimization, and bankroll discipline."
keywords: "how to win sportpesa mega jackpot, sportpesa jackpot strategy, sportpesa 17 games prediction, jackpot mathematical model, mega jackpot bonus tips"
link: "/how-to-win-sportpesa-mega-jackpot"
type: "blog"
category: "Jackpot Strategy & Mathematical Modeling"
readingTime: "8 min read"
authorId: "john-mwangi"
tags: ["SportPesa", "Mega Jackpot", "Poisson Distribution", "Expected Value", "Kenyan Betting"]
datePublished: "2026-03-15T08:00:00+03:00"
dateModified: "2026-03-18T10:30:00+03:00"
---
```

- **`tags`**: Array of topic keywords rendered as `#Tag` badges at the article footer.
- **`category`**: Editorial topic category for navigation and badge styling.
- **`authorId`**: Matches the author markdown file in `src/content/authors/<authorId>.md`.
- **`readingTime`**: Read duration override (auto-calculated if omitted).
- **`responsibleGambling`**: Custom advisory text for compliance.

---

## 5. Inline Modifiers & Parameters

You can customize the behavior of any tag with inline attributes:

| Parameter | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| **Count** | `:N` or `count=N` | Controls how many fixtures are rendered for Top Confidence or Double Chance. | `{{DOUBLE_CHANCE_FIXTURES:3}}` |
| **Format** | `:list`, `:short`, `:paragraph` | Changes output style for sub-combos and bonus tiers. | `{{JACKPOT_SUB_COMBOS:list}}` |
| **Jackpot** | `jackpot="<id>"` or `id="<id>"` | Overrides the default jackpot on a generic tag. | `{{JACKPOT_SCHEDULE jackpot="mozzart-grand"}}` |
| **Mode** | `:curated`, `:fixtures`, `:auto` | Forces either live fixture extraction or curated historical defaults. | `{{JACKPOT_LEAGUES:fixtures}}` |

---

## 6. Complete Markdown Template Example

Here is an example showing how tags can be used naturally in any jackpot markdown file:

```markdown
---
title: "Betika Midweek Jackpot Predictions This Week (15 Games)"
displayTitle: "Betika Midweek Jackpot Tips & Tactical Analysis"
description: "Expert Betika Midweek Jackpot predictions with full match tips, double chance options, and bonus combinations."
type: "jackpot"
jackpotId: "betika-midweek"
---

## Betika Midweek Jackpot Predictions This Week

<!-- INTRO -->
Welcome to Soka King's Betika Midweek Jackpot prediction portal. Matches kick off on {{JACKPOT_SCHEDULE}}, featuring competitive fixtures from {{JACKPOT_LEAGUES}}. This round's computer model {{JACKPOT_SELECTIONS_INCLUDE}}.

<!-- MIDDLE -->
The Betika Midweek Jackpot challenges players to correctly predict 15 football games for a stake of KSh 15. Our analytical engine evaluates recent form, underlying expected goals (xG), and head-to-head records to help you compete for the top prize.

{{JACKPOT_UPSET_ALERT}}

<!-- MEAT -->
## Betika Midweek Jackpot Tactical Overview

### Prize Structure & Combinations
{{JACKPOT_SUB_COMBOS:list}}

### Recommended Double Chance Coverage
{{DOUBLE_CHANCE_FIXTURES:4}}

### Top Predictions by Confidence
{{TOP_CONFIDENCE_FIXTURES:5}}
```
