import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MoodEntry, getTodayKey, useAuth } from '../context/AuthContext';
import { computeMoodActivityCorrelation } from '../utils/metrics';

const MOODS: MoodEntry['mood'][] = ['Happy', 'Calm', 'Neutral', 'Stressed', 'Tired', 'Anxious'];

export const MoodTrackerPage: React.FC = () => {
  const { moodEntries, practiceLogs, logMood } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood']>('Calm');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      await logMood({
        mood: selectedMood,
        energyLevel,
        dateKey: getTodayKey(),
        note,
      });
      setNote('');
      setSavedMsg('Check-in recorded.');
    } finally {
      setSaving(false);
    }
  };

  const weeklyChartData = useMemo(() => {
    return [...moodEntries]
      .slice(0, 14)
      .reverse()
      .map((m) => ({
        date: m.dateKey.slice(5),
        energy: m.energyLevel,
        mood: m.mood,
      }));
  }, [moodEntries]);

  const correlation = useMemo(
    () => computeMoodActivityCorrelation(moodEntries, practiceLogs),
    [moodEntries, practiceLogs]
  );

  return (
    <div className="space-y-8">
      {/* Check-in Form */}
      <section className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#E2E6DF] bg-white p-6 lg:col-span-6 dark:border-[#24322B] dark:bg-[#16201B]"
        >
          <h2 className="font-display text-2xl font-semibold">Daily Mood &amp; Energy Check-In</h2>
          <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
            Reflective self-awareness tool only. Not a clinical or diagnostic assessment.
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              How are you feeling today?
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMood(m)}
                  className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                    selectedMood === m
                      ? 'border-[#2F5D46] bg-[#2F5D46] text-white'
                      : 'border-[#D7DDD6] bg-[#F8F7F4] text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              <span>Energy Level</span>
              <span className="font-mono tabular-nums">{energyLevel} / 5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="mt-2 w-full accent-[#2F5D46]"
            />
          </div>

          <div className="mt-5">
            <label className="block text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              Optional Reflection Note
              <textarea
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note sleep quality, movement, or anything on your mind..."
                className="mt-1.5 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] p-3 text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              />
            </label>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#2F5D46] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#264C39] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Check-In'}
            </button>
            {savedMsg && (
              <span className="text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                {savedMsg}
              </span>
            )}
          </div>
        </form>

        {/* Correlation & Trend */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <h3 className="font-display text-lg font-semibold">
              Practice &amp; Energy Correlation
            </h3>
            <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
              Calculated strictly from your recorded mood entries and practice logs.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-4 dark:border-[#2C3A33] dark:bg-[#111915]">
                <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Practice Days Avg Energy</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                  {correlation.practiceDayAvgEnergy !== null
                    ? `${correlation.practiceDayAvgEnergy}/5`
                    : '—'}
                </p>
                <p className="mt-1 text-[11px] text-[#5B6860] tabular-nums dark:text-[#98A79E]">
                  {correlation.practiceMoodCount} check-ins
                </p>
              </div>
              <div className="rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-4 dark:border-[#2C3A33] dark:bg-[#111915]">
                <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Rest Days Avg Energy</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                  {correlation.restDayAvgEnergy !== null
                    ? `${correlation.restDayAvgEnergy}/5`
                    : '—'}
                </p>
                <p className="mt-1 text-[11px] text-[#5B6860] tabular-nums dark:text-[#98A79E]">
                  {correlation.restMoodCount} check-ins
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <h3 className="font-display text-lg font-semibold">Recent Energy Trend</h3>
            {weeklyChartData.length === 0 ? (
              <p className="mt-4 text-sm text-[#526058] dark:text-[#A9B6AE]">
                Log your first check-in to plot your energy trend.
              </p>
            ) : (
              <div className="mt-4 h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyChartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6D7A72" />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} width={26} stroke="#6D7A72" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="#2F5D46"
                      fill="#2F5D46"
                      fillOpacity={0.18}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Monthly Check-In History */}
      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <h3 className="font-display text-lg font-semibold">Check-In History</h3>
        {moodEntries.length === 0 ? (
          <p className="mt-3 text-sm text-[#526058] dark:text-[#A9B6AE]">
            No mood entries recorded yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[#E2E6DF] text-sm dark:divide-[#24322B]">
            {moodEntries.slice(0, 30).map((entry) => (
              <div key={entry.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">
                    {entry.mood} · <span className="font-mono text-xs tabular-nums">Energy {entry.energyLevel}/5</span>
                  </p>
                  {entry.note && (
                    <p className="mt-0.5 text-xs text-[#526058] dark:text-[#A9B6AE]">
                      {entry.note}
                    </p>
                  )}
                </div>
                <span className="font-mono text-xs tabular-nums text-[#5B6860] dark:text-[#98A79E]">
                  {entry.dateKey}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
