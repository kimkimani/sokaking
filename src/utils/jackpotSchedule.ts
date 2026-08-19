import { Fixture } from '../types';
import { JackpotConfig } from '../jackpotsData';

/**
 * Calculates a dynamic ISO timestamp string in Kenyan Time (+03:00 / EAT)
 * @param targetDayOfWeek 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
 * @param hour Hour in 24h format (Kenyan Time)
 * @param minute Minute
 * @param dayOffset Additional days to offset
 */
export function getUpcomingKenyanDate(
  targetDayOfWeek: number,
  hour: number,
  minute: number,
  dayOffset: number = 0
): string {
  const now = new Date();
  
  // Convert now to Africa/Nairobi local time components
  const kenyaDateString = now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
  const kenyaNow = new Date(kenyaDateString);
  
  const currentDay = kenyaNow.getDay();
  let daysUntil = (targetDayOfWeek - currentDay + 7) % 7;
  
  // If target day is today, check if kickoff has already passed in Kenya
  if (daysUntil === 0) {
    const currentHour = kenyaNow.getHours();
    const currentMin = kenyaNow.getMinutes();
    if (currentHour > hour || (currentHour === hour && currentMin >= minute)) {
      daysUntil = 7; // Advance to next week's round
    }
  }

  const target = new Date(kenyaNow);
  target.setDate(kenyaNow.getDate() + daysUntil + dayOffset);
  target.setHours(hour, minute, 0, 0);

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  const hh = String(target.getHours()).padStart(2, '0');
  const min = String(target.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00+03:00`;
}

/**
 * Calculates a dynamic daily upcoming ISO timestamp in Kenyan Time (+03:00 / EAT)
 */
export function getDailyKenyanDate(
  hour: number,
  minute: number,
  dayOffset: number = 0
): string {
  const now = new Date();
  const kenyaDateString = now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
  const kenyaNow = new Date(kenyaDateString);

  const currentHour = kenyaNow.getHours();
  const currentMin = kenyaNow.getMinutes();

  let daysToAdd = dayOffset;
  if (dayOffset === 0 && (currentHour > hour || (currentHour === hour && currentMin >= minute))) {
    daysToAdd = 1; // Passed today, schedule for tomorrow
  }

  const target = new Date(kenyaNow);
  target.setDate(kenyaNow.getDate() + daysToAdd);
  target.setHours(hour, minute, 0, 0);

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  const hh = String(target.getHours()).padStart(2, '0');
  const min = String(target.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00+03:00`;
}

/**
 * Schedule rules for Kenyan Jackpots:
 * Defines target kickoff day and match timing distribution
 */
interface ScheduleRule {
  targetDayOfWeek?: number; // 0-6 (Sun-Sat)
  isDaily?: boolean;
  baseHour: number;
  baseMinute: number;
  matchOffsets: Array<{ dayOffset: number; hour: number; minute: number }>;
}

const JACKPOT_SCHEDULE_RULES: Record<string, ScheduleRule> = {
  'sportpesa-mega': {
    targetDayOfWeek: 6, // Saturday
    baseHour: 16,
    baseMinute: 30,
    matchOffsets: [
      { dayOffset: 0, hour: 16, minute: 30 }, // Game 1
      { dayOffset: 0, hour: 17, minute: 0 },  // Game 2
      { dayOffset: 0, hour: 17, minute: 0 },  // Game 3
      { dayOffset: 0, hour: 18, minute: 30 }, // Game 4
      { dayOffset: 0, hour: 19, minute: 30 }, // Game 5
      { dayOffset: 0, hour: 21, minute: 0 },  // Game 6
      { dayOffset: 0, hour: 22, minute: 0 },  // Game 7
      { dayOffset: 1, hour: 14, minute: 0 },  // Game 8 (Sunday)
      { dayOffset: 1, hour: 15, minute: 30 }, // Game 9
      { dayOffset: 1, hour: 16, minute: 30 }, // Game 10
      { dayOffset: 1, hour: 17, minute: 0 },  // Game 11
      { dayOffset: 1, hour: 18, minute: 30 }, // Game 12
      { dayOffset: 1, hour: 19, minute: 30 }, // Game 13
      { dayOffset: 1, hour: 20, minute: 0 },  // Game 14
      { dayOffset: 1, hour: 21, minute: 0 },  // Game 15
      { dayOffset: 1, hour: 21, minute: 45 }, // Game 16
      { dayOffset: 1, hour: 22, minute: 0 },  // Game 17
    ]
  },
  'sportpesa-midweek': {
    targetDayOfWeek: 3, // Wednesday
    baseHour: 18,
    baseMinute: 0,
    matchOffsets: [
      { dayOffset: 0, hour: 18, minute: 0 },
      { dayOffset: 0, hour: 19, minute: 0 },
      { dayOffset: 0, hour: 19, minute: 30 },
      { dayOffset: 0, hour: 20, minute: 45 },
      { dayOffset: 0, hour: 21, minute: 0 },
      { dayOffset: 0, hour: 21, minute: 45 },
      { dayOffset: 0, hour: 22, minute: 0 },
      { dayOffset: 1, hour: 18, minute: 30 }, // Thursday
      { dayOffset: 1, hour: 19, minute: 0 },
      { dayOffset: 1, hour: 20, minute: 0 },
      { dayOffset: 1, hour: 21, minute: 0 },
      { dayOffset: 1, hour: 21, minute: 45 },
      { dayOffset: 1, hour: 22, minute: 0 }
    ]
  },
  'betika-midweek': {
    targetDayOfWeek: 3, // Wednesday
    baseHour: 17,
    baseMinute: 0,
    matchOffsets: [
      { dayOffset: 0, hour: 17, minute: 0 },
      { dayOffset: 0, hour: 18, minute: 0 },
      { dayOffset: 0, hour: 18, minute: 30 },
      { dayOffset: 0, hour: 19, minute: 30 },
      { dayOffset: 0, hour: 20, minute: 45 },
      { dayOffset: 0, hour: 21, minute: 0 },
      { dayOffset: 0, hour: 21, minute: 30 },
      { dayOffset: 0, hour: 22, minute: 0 },
      { dayOffset: 1, hour: 17, minute: 30 },
      { dayOffset: 1, hour: 18, minute: 0 },
      { dayOffset: 1, hour: 19, minute: 0 },
      { dayOffset: 1, hour: 20, minute: 0 },
      { dayOffset: 1, hour: 21, minute: 0 },
      { dayOffset: 1, hour: 21, minute: 45 },
      { dayOffset: 1, hour: 22, minute: 0 }
    ]
  },
  'mozzart-grand': {
    targetDayOfWeek: 6, // Saturday
    baseHour: 16,
    baseMinute: 0,
    matchOffsets: [
      { dayOffset: 0, hour: 16, minute: 0 },
      { dayOffset: 0, hour: 16, minute: 30 },
      { dayOffset: 0, hour: 17, minute: 0 },
      { dayOffset: 0, hour: 17, minute: 30 },
      { dayOffset: 0, hour: 18, minute: 30 },
      { dayOffset: 0, hour: 19, minute: 0 },
      { dayOffset: 0, hour: 19, minute: 30 },
      { dayOffset: 0, hour: 20, minute: 45 },
      { dayOffset: 0, hour: 21, minute: 30 },
      { dayOffset: 0, hour: 22, minute: 0 },
      { dayOffset: 1, hour: 14, minute: 30 },
      { dayOffset: 1, hour: 15, minute: 0 },
      { dayOffset: 1, hour: 16, minute: 0 },
      { dayOffset: 1, hour: 17, minute: 0 },
      { dayOffset: 1, hour: 18, minute: 0 },
      { dayOffset: 1, hour: 18, minute: 30 },
      { dayOffset: 1, hour: 19, minute: 30 },
      { dayOffset: 1, hour: 20, minute: 0 },
      { dayOffset: 1, hour: 21, minute: 0 },
      { dayOffset: 1, hour: 22, minute: 0 }
    ]
  },
  'mozzart-super-daily': {
    isDaily: true,
    baseHour: 17,
    baseMinute: 30,
    matchOffsets: [
      { dayOffset: 0, hour: 17, minute: 30 },
      { dayOffset: 0, hour: 18, minute: 0 },
      { dayOffset: 0, hour: 18, minute: 30 },
      { dayOffset: 0, hour: 19, minute: 0 },
      { dayOffset: 0, hour: 19, minute: 30 },
      { dayOffset: 0, hour: 20, minute: 0 },
      { dayOffset: 0, hour: 20, minute: 30 },
      { dayOffset: 0, hour: 20, minute: 45 },
      { dayOffset: 0, hour: 21, minute: 0 },
      { dayOffset: 0, hour: 21, minute: 15 },
      { dayOffset: 0, hour: 21, minute: 30 },
      { dayOffset: 0, hour: 21, minute: 45 },
      { dayOffset: 0, hour: 22, minute: 0 },
      { dayOffset: 0, hour: 22, minute: 15 },
      { dayOffset: 0, hour: 22, minute: 30 },
      { dayOffset: 0, hour: 23, minute: 0 }
    ]
  },
  'odibet-laki-tatu': {
    isDaily: true,
    baseHour: 18,
    baseMinute: 0,
    matchOffsets: [
      { dayOffset: 0, hour: 18, minute: 0 },
      { dayOffset: 0, hour: 18, minute: 30 },
      { dayOffset: 0, hour: 19, minute: 0 },
      { dayOffset: 0, hour: 19, minute: 30 },
      { dayOffset: 0, hour: 20, minute: 0 },
      { dayOffset: 0, hour: 20, minute: 30 },
      { dayOffset: 0, hour: 21, minute: 0 },
      { dayOffset: 0, hour: 21, minute: 30 },
      { dayOffset: 0, hour: 22, minute: 0 },
      { dayOffset: 0, hour: 22, minute: 30 }
    ]
  },
  'betpawa-pick-jackpot': {
    targetDayOfWeek: 5, // Friday
    baseHour: 18,
    baseMinute: 30,
    matchOffsets: [
      { dayOffset: 0, hour: 18, minute: 30 },
      { dayOffset: 0, hour: 19, minute: 0 },
      { dayOffset: 0, hour: 19, minute: 30 },
      { dayOffset: 0, hour: 20, minute: 45 },
      { dayOffset: 0, hour: 21, minute: 0 },
      { dayOffset: 0, hour: 21, minute: 30 },
      { dayOffset: 0, hour: 22, minute: 0 },
      { dayOffset: 1, hour: 16, minute: 0 }, // Saturday
      { dayOffset: 1, hour: 17, minute: 0 },
      { dayOffset: 1, hour: 18, minute: 30 },
      { dayOffset: 1, hour: 19, minute: 30 },
      { dayOffset: 1, hour: 21, minute: 0 },
      { dayOffset: 1, hour: 22, minute: 0 }
    ]
  },
  'sportybet-jackpot': {
    targetDayOfWeek: 6, // Saturday
    baseHour: 16,
    baseMinute: 0,
    matchOffsets: [
      { dayOffset: 0, hour: 16, minute: 0 },
      { dayOffset: 0, hour: 16, minute: 30 },
      { dayOffset: 0, hour: 17, minute: 0 },
      { dayOffset: 0, hour: 18, minute: 30 },
      { dayOffset: 0, hour: 19, minute: 30 },
      { dayOffset: 0, hour: 21, minute: 0 },
      { dayOffset: 1, hour: 15, minute: 0 }, // Sunday
      { dayOffset: 1, hour: 16, minute: 30 },
      { dayOffset: 1, hour: 18, minute: 0 },
      { dayOffset: 1, hour: 19, minute: 0 },
      { dayOffset: 1, hour: 20, minute: 30 },
      { dayOffset: 1, hour: 21, minute: 45 }
    ]
  }
};

/**
 * Synchronizes jackpot fixtures and countdown start times to actual Kenyan Time (+03:00 / EAT)
 */
export function applyDynamicKenyanSchedule(rawJackpots: JackpotConfig[]): JackpotConfig[] {
  return rawJackpots.map((jackpot) => {
    const ruleKey = jackpot.id.toLowerCase();
    const rule = JACKPOT_SCHEDULE_RULES[ruleKey] || {
      targetDayOfWeek: 6,
      baseHour: 16,
      baseMinute: 30,
      matchOffsets: []
    };

    const fixtures: Fixture[] = (jackpot.fixtures || []).map((fixture, idx) => {
      let kickoffTimeStr: string;
      const offsetConfig = rule.matchOffsets[idx];

      if (offsetConfig) {
        if (rule.isDaily) {
          kickoffTimeStr = getDailyKenyanDate(offsetConfig.hour, offsetConfig.minute, offsetConfig.dayOffset);
        } else {
          kickoffTimeStr = getUpcomingKenyanDate(rule.targetDayOfWeek ?? 6, offsetConfig.hour, offsetConfig.minute, offsetConfig.dayOffset);
        }
      } else {
        // Fallback offset
        const fallbackDayOffset = Math.floor(idx / 8);
        const fallbackHour = 16 + (idx % 6);
        if (rule.isDaily) {
          kickoffTimeStr = getDailyKenyanDate(fallbackHour, 0, fallbackDayOffset);
        } else {
          kickoffTimeStr = getUpcomingKenyanDate(rule.targetDayOfWeek ?? 6, fallbackHour, 0, fallbackDayOffset);
        }
      }

      return {
        ...fixture,
        kickoffTime: kickoffTimeStr,
        date: kickoffTimeStr.split('T')[0],
        time: kickoffTimeStr.split('T')[1]?.slice(0, 5) || '18:00'
      };
    });

    // Determine earliest game time
    const earliestTimeStr = fixtures.length > 0 ? fixtures[0].kickoffTime : null;
    let nextGameStartTime = jackpot.nextGameStartTime;

    if (earliestTimeStr) {
      const d = new Date(earliestTimeStr);
      const dayFormatted = d.toLocaleDateString('en-GB', {
        timeZone: 'Africa/Nairobi',
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      const timeFormatted = d.toLocaleTimeString('en-GB', {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      nextGameStartTime = `Starts ${dayFormatted} • ${timeFormatted} EAT (Nairobi)`;
    }

    return {
      ...jackpot,
      fixtures,
      nextGameStartTime
    };
  });
}
