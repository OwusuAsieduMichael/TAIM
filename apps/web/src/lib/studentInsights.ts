const SNAPSHOT_KEY = 'taim-student-insight-snapshot';

export type InsightSnapshot = {
  avg: number;
  subjectCount: number;
  savedAt: string;
};

export function readInsightSnapshot(): InsightSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InsightSnapshot;
  } catch {
    return null;
  }
}

export function writeInsightSnapshot(avg: number, subjectCount: number) {
  const payload: InsightSnapshot = {
    avg,
    subjectCount,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export type InsightBannerVariant = 'success' | 'warning' | 'info' | 'celebrate';

export type InsightBannerModel = {
  variant: InsightBannerVariant;
  message: string;
};

export function buildInsightBanner(input: {
  online: boolean;
  rows: readonly { finalScore: number }[];
  average: number | null;
  weakSubject?: string;
  bestSubject?: string;
}): InsightBannerModel {
  if (!input.online) {
    return {
      variant: 'warning',
      message: 'You appear to be offline. Showing your last loaded data — reconnect to refresh.',
    };
  }
  if (input.average === null || input.rows.length === 0) {
    return {
      variant: 'info',
      message: 'No published results yet. Your performance snapshot will light up here as soon as teachers release grades.',
    };
  }

  const snap = readInsightSnapshot();
  if (snap && snap.subjectCount > 0 && input.rows.length >= snap.subjectCount) {
    const delta = Math.round((input.average - snap.avg) * 10) / 10;
    if (delta >= 3) {
      return {
        variant: 'celebrate',
        message: `You improved by about ${delta}% compared to your last visit. Keep the momentum going.`,
      };
    }
    if (delta <= -3) {
      return {
        variant: 'info',
        message: `Scores shifted since last time — that happens. Focus on steady revision; small gains add up fast.`,
      };
    }
  }

  if (input.average >= 85) {
    return {
      variant: 'celebrate',
      message: `Outstanding average across your subjects — you're among the strongest learners in this snapshot.`,
    };
  }

  if (input.weakSubject && input.average < 72) {
    return {
      variant: 'warning',
      message: `${input.weakSubject} could use extra revision time. Short daily practice beats cramming.`,
    };
  }

  if (input.bestSubject && input.average >= 70) {
    return {
      variant: 'success',
      message: `${input.bestSubject} is a bright spot — use that confidence in other subjects too.`,
    };
  }

  return {
    variant: 'info',
    message: `You're on track. Check results for details, and keep attendance steady so nothing slips through the cracks.`,
  };
}
