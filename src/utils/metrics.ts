import { PracticeLog, MoodEntry, getTodayKey } from '../context/AuthContext';

export function computeStreak(logs: PracticeLog[]): { current: number; longest: number } {
  if (!logs.length) return { current: 0, longest: 0 };
  const dateSet = new Set(logs.map((l) => l.dateKey));
  const sortedDates = Array.from(dateSet).sort();

  let longest = 0;
  let run = 0;
  let prevTime: number | null = null;

  for (const dk of sortedDates) {
    const t = new Date(`${dk}T00:00:00`).getTime();
    if (prevTime !== null && Math.round((t - prevTime) / 86400000) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prevTime = t;
  }

  // Current streak counting backwards from today or yesterday
  const today = new Date(`${getTodayKey()}T00:00:00`);
  let current = 0;
  let cursor = new Date(today);
  if (!dateSet.has(formatDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dateSet.has(formatDateKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest };
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLastNDaysSeries(logs: PracticeLog[], days = 7) {
  const result: { dateKey: string; label: string; minutes: number; sessions: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    const dayLogs = logs.filter((l) => l.dateKey === key);
    result.push({
      dateKey: key,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: dayLogs.reduce((acc, cur) => acc + cur.durationMinutes, 0),
      sessions: dayLogs.length,
    });
  }
  return result;
}

export function computeMoodActivityCorrelation(
  moods: MoodEntry[],
  logs: PracticeLog[]
): {
  practiceDayAvgEnergy: number | null;
  restDayAvgEnergy: number | null;
  practiceMoodCount: number;
  restMoodCount: number;
} {
  if (!moods.length) {
    return {
      practiceDayAvgEnergy: null,
      restDayAvgEnergy: null,
      practiceMoodCount: 0,
      restMoodCount: 0,
    };
  }
  const activeDates = new Set(logs.map((l) => l.dateKey));
  const onPractice = moods.filter((m) => activeDates.has(m.dateKey));
  const onRest = moods.filter((m) => !activeDates.has(m.dateKey));

  const avg = (arr: MoodEntry[]) =>
    arr.length ? Number((arr.reduce((s, m) => s + m.energyLevel, 0) / arr.length).toFixed(1)) : null;

  return {
    practiceDayAvgEnergy: avg(onPractice),
    restDayAvgEnergy: avg(onRest),
    practiceMoodCount: onPractice.length,
    restMoodCount: onRest.length,
  };
}
