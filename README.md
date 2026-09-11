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
| `sportybet-jackpot` | SportyBet 12 Jackpot | 12 | KSh 50 | `SPORTYBET_JACKPOT_`, `SPORTYBET_` |
| `betpawa-pick-jackpot` | betPawa Pick13 Jackpot | 13 | KSh 5–10 | `BETPAWA_PICK_JACKPOT_`, `BETPAWA_PICK_`, `BETPAWA_` |
| `odibet-laki-tatu` | Odibets Laki Tatu Daily Jackpot | 10 | KSh 15 | `ODIBET_LAKI_TATU_`, `ODIBET_`, `LAKI_TATU_` |
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

## 5. Tag Modifiers & Parameters

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
