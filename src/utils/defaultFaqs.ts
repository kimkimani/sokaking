export interface FaqItem {
  question: string;
  answer: string;
}

export function getDefaultFaqsForPage(pageId: string): FaqItem[] {
  const normalized = (pageId || '').toLowerCase().trim();

  // VIP Packages & Odds Packs
  if (normalized.includes('vip') || normalized.includes('odds') || normalized === 'vip-packages') {
    return [
      {
        question: "What is included in Soka King VIP Packages & Odds Packs?",
        answer: "VIP packages grant full access to curated daily 2+ odds shortlists, 5+ odds accumulators, complete 15 & 17 game jackpot slips, and instant SMS alerts."
      },
      {
        question: "How do I subscribe and unlock VIP tips using M-Pesa?",
        answer: "Choose your preferred VIP package or Odds Pack, enter your Safaricom mobile phone number, and click **Buy Pack**. An M-Pesa STK push prompt will pop up on your phone screen asking for your M-Pesa PIN."
      },
      {
        question: "How long does my VIP subscription remain active?",
        answer: "Depending on your selection (Daily, Weekly, or Monthly), your VIP access activates instantly upon checkout and stays valid across all devices linked to your phone number."
      },
      {
        question: "What is the hit accuracy of Soka King VIP predictions?",
        answer: "Our VIP algorithms analyze Poisson goal expectancy, squad fatigue, and market liquidity to deliver an average **85% - 89% winning accuracy**."
      }
    ];
  }

  // Today Predictions
  if (normalized === 'category-today' || normalized === 'today') {
    return [
      {
        question: "How early are today's football predictions updated?",
        answer: "Today's prediction card is updated every morning by 06:00 EAT with continuous adjustments for late team news and line-up changes."
      },
      {
        question: "Are today's football predictions 100% free on Soka King?",
        answer: "Yes! All tips and match analyses listed on Today's Predictions page are completely free to access."
      },
      {
        question: "How does Soka King calculate today's prediction probabilities?",
        answer: "We utilize Poisson distribution models, goal conversion rates, head-to-head metrics, and team motivation indicators to compute outcome probabilities."
      }
    ];
  }

  // Tomorrow Predictions
  if (normalized === 'category-tomorrow' || normalized === 'tomorrow') {
    return [
      {
        question: "When are tomorrow's football predictions published?",
        answer: "Tomorrow's match card is published 24 hours in advance so you can compare prices and capture early value odds."
      },
      {
        question: "Why should I check tomorrow's tips early?",
        answer: "Bookmakers adjust prices closer to kick-off. Reviewing tomorrow's card early allows you to lock in higher odds before market shifts."
      }
    ];
  }

  // Yesterday Predictions
  if (normalized === 'category-yesterday' || normalized === 'yesterday') {
    return [
      {
        question: "How do I check yesterday's prediction results and accuracy?",
        answer: "All yesterday's predictions are transparently archived with final match scores and green checkmarks for winning selections."
      },
      {
        question: "Are historical prediction results on Soka King modified?",
        answer: "Never. We maintain 100% transparent records so you can verify our mathematical model's accuracy."
      }
    ];
  }

  // Home Win (1)
  if (normalized.includes('homewin') || normalized.includes('home-win')) {
    return [
      {
        question: "What qualifies a match for the Home Win (1) category?",
        answer: "We select teams with home win percentages exceeding 70%, strong home goal differential, and defensive stability against struggling away opposition."
      },
      {
        question: "What is the historical hit rate for Home Win picks?",
        answer: "Our Home Win selection algorithm averages an 82% to 85% success rate across major European and African leagues."
      }
    ];
  }

  // BTTS / GG
  if (normalized.includes('btts') || normalized.includes('gg')) {
    return [
      {
        question: "What does Both Teams To Score (BTTS / GG) mean?",
        answer: "A BTTS selection wins if both the home team and away team score at least one goal during regular match play."
      },
      {
        question: "Which statistics drive Soka King's BTTS picks?",
        answer: "We filter for fixtures where both competing teams exhibit high offensive goal conversion alongside weak defensive clean-sheet records."
      }
    ];
  }

  // Over 2.5 Goals
  if (normalized.includes('over25') || normalized.includes('over-2-5')) {
    return [
      {
        question: "What does Over 2.5 Goals prediction mean?",
        answer: "An Over 2.5 Goals selection wins if 3 or more total goals are scored in the match (e.g., 2-1, 3-0, 2-2)."
      },
      {
        question: "Which football leagues feature most in Over 2.5 predictions?",
        answer: "High-tempo leagues such as the Dutch Eredivisie, German Bundesliga, and Norwegian Eliteserien consistently feature in our picks."
      }
    ];
  }

  // Over 1.5 Goals
  if (normalized.includes('over15') || normalized.includes('over-1-5')) {
    return [
      {
        question: "What does Over 1.5 Goals prediction mean?",
        answer: "Over 1.5 Goals wins when at least 2 total goals are scored during the 90 minutes of regular match play."
      },
      {
        question: "Is Over 1.5 Goals safe for building multi-bets?",
        answer: "Yes, Over 1.5 Goals offers high mathematical probability and low volatility, making it an ideal anchor leg for accumulator slips."
      }
    ];
  }

  // Double Chance
  if (normalized.includes('doublechance') || normalized.includes('double-chance')) {
    return [
      {
        question: "What is a Double Chance prediction (1X, X2, 12)?",
        answer: "Double Chance allows you to cover two out of three possible match outcomes in a single pick, significantly hedging match risk."
      },
      {
        question: "When is Double Chance recommended?",
        answer: "Ideal for tight derby games, cup ties, or when backing strong away teams playing in tough stadiums."
      }
    ];
  }

  // 254 Sure Tips
  if (normalized.includes('254-sure-tips') || normalized.includes('254')) {
    return [
      {
        question: "What are 254 Sure Tips on Soka King?",
        answer: "254 Sure Tips are high-confidence daily football predictions specifically tailored for Kenyan sports punters."
      },
      {
        question: "How do I unlock 254 Sure Tips via M-Pesa?",
        answer: "Click unlock, enter your Safaricom mobile line, and approve the M-Pesa STK push prompt directly on your handset screen."
      }
    ];
  }

  // Cheerplex
  if (normalized.includes('cheerplex')) {
    return [
      {
        question: "What are Cheerplex predictions and tips today?",
        answer: "Cheerplex tips are algorithmically verified daily selections focusing on high probability 1X2, Over/Under, and BTTS picks."
      },
      {
        question: "Are Cheerplex tips updated daily?",
        answer: "Yes, Cheerplex picks are updated every morning at 06:00 EAT with comprehensive statistical breakdowns."
      }
    ];
  }

  // Liobet
  if (normalized.includes('liobet')) {
    return [
      {
        question: "What are Liobet football predictions?",
        answer: "Liobet tips deliver statistical picks across top European leagues, UEFA competitions, and international fixtures."
      },
      {
        question: "How reliable are Liobet tips on Soka King?",
        answer: "Our Liobet engine evaluates expected goals (xG), head-to-head records, and team momentum to deliver an 85%+ hit rate."
      }
    ];
  }

  // Sunpel & Sunpelpredict
  if (normalized.includes('sunpel')) {
    return [
      {
        question: "What is Sunpelpredict and what free tips does it provide?",
        answer: "Sunpelpredict delivers daily free mathematical football predictions, high-confidence banker selections, double chance picks, and accumulator combinations."
      },
      {
        question: "How do I maximize returns using Sunpelpredict daily tips?",
        answer: "Combine 2-3 Sunpelpredict banker picks into a daily low-risk accumulator or use them to cover strategic double chances on major Kenyan jackpot tickets."
      }
    ];
  }

  // SportPesa Mega
  if (normalized.includes('sportpesa-mega')) {
    return [
      {
        question: "How does Soka King analyze the SportPesa Mega Jackpot (17 Games)?",
        answer: "We analyze all 17 fixtures using Poisson goal distribution, home/away form, and head-to-head records to generate double chance combinations."
      },
      {
        question: "How do I unlock the SportPesa Mega Jackpot prediction slip?",
        answer: "Tap unlock, enter your Safaricom phone number, and confirm the M-Pesa STK push prompt to reveal all 17 match selections."
      },
      {
        question: "What are the SportPesa Mega Jackpot bonus tiers?",
        answer: "SportPesa awards cash bonuses for 12, 13, 14, 15, and 16 correct predictions. Our double chance slips target bonus thresholds."
      }
    ];
  }

  // SportPesa Midweek
  if (normalized.includes('sportpesa-midweek')) {
    return [
      {
        question: "How many games are in the SportPesa Midweek Jackpot?",
        answer: "The SportPesa Midweek Jackpot features 13 matches played between Tuesday and Thursday."
      },
      {
        question: "How do I unlock SportPesa Midweek VIP picks?",
        answer: "Unlock the midweek ticket directly on this page via instant M-Pesa STK push checkout."
      }
    ];
  }

  // Betika Midweek
  if (normalized.includes('betika-midweek')) {
    return [
      {
        question: "What is the Betika Midweek Jackpot prize pool?",
        answer: "The Betika Midweek Jackpot offers Ksh 15 Million for 15 correct match picks."
      },
      {
        question: "Does Soka King provide double chance combinations for Betika Midweek?",
        answer: "Yes! We provide optimal 2-3 double chance combinations to maximize bonus probability."
      }
    ];
  }

  // Betika Grand
  if (normalized.includes('betika-grand')) {
    return [
      {
        question: "How many matches are in the Betika Grand Jackpot?",
        answer: "The Betika Grand Jackpot consists of 17 weekly matches played over the weekend."
      },
      {
        question: "How are Betika Grand Jackpot predictions generated?",
        answer: "Selections are generated via statistical modeling factoring team motivation, squad rotation, and historical head-to-head trends."
      }
    ];
  }

  // Mozzart Jackpots
  if (normalized.includes('mozzart')) {
    return [
      {
        question: "What is the Mozzart Super Grand Jackpot?",
        answer: "The Mozzart Super Grand Jackpot features 20 games with a massive Ksh 200 Million cash prize."
      },
      {
        question: "Are Mozzart Jackpot predictions available daily?",
        answer: "Yes, we cover both the 20-game Super Grand weekend jackpot and the daily Mozzart Jackpots."
      }
    ];
  }

  // Jackpot List
  if (normalized.includes('jackpot')) {
    return [
      {
        question: "Which Kenyan bookmaker jackpots are available on Soka King?",
        answer: "We cover SportPesa Mega & Midweek, Betika Midweek & Grand, Mozzart Super Grand & Daily, Betpawa, SportyBet, and Odibets jackpots."
      },
      {
        question: "How do I unlock jackpot prediction slips?",
        answer: "Click on any jackpot card, enter your Safaricom mobile number, and authorize payment via M-Pesa STK push."
      }
    ];
  }

  // Generic Default Fallback
  return [
    {
      question: `How does Soka King generate predictions for ${pageId}?`,
      answer: "Our sports intelligence algorithms combine Poisson goal distribution, team form, head-to-head records, and team motivation metrics."
    },
    {
      question: "How do I unlock premium tips and jackpot predictions?",
      answer: "Enter your Safaricom line and approve the M-Pesa STK push prompt to unlock instant access on your screen and via SMS."
    },
    {
      question: "When are these predictions updated?",
      answer: "Predictions on Soka King are updated every morning at 06:00 EAT with real-time adjustments prior to match kickoff."
    }
  ];
}
