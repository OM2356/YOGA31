import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Trash2 } from 'lucide-react';
import { useAuth, getTodayKey } from '../context/AuthContext';
import { DEEP_DIVE_PROGRAMS } from '../data/wellnessData';
import { computeStreak, getLastNDaysSeries } from '../utils/metrics';

export const AnalyticsPage: React.FC = () => {
  const { practiceLogs, progress, enrollments, deletePracticeLog } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'yoga' | 'meditation' | 'breathing'>('all');

  const todayKey = getTodayKey();
  const streak = useMemo(() => computeStreak(practiceLogs), [practiceLogs]);
  const weeklySeries = useMemo(() => getLastNDaysSeries(practiceLogs, 7), [practiceLogs]);

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const weekCutoff = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;

  const todayMinutes = practiceLogs
    .filter((l) => l.dateKey === todayKey)
    .reduce((s, l) => s + l.durationMinutes, 0);

  const weeklyYogaSessions = practiceLogs.filter(
    (l) => l.type === 'yoga' && l.dateKey >= weekCutoff
  ).length;

  const monthlyMeditationSessions = practiceLogs.filter(
    (l) => l.type === 'meditation' && l.dateKey.startsWith(monthPrefix)
  ).length;

  const totalLessons = DEEP_DIVE_PROGRAMS.reduce((s, p) => s + p.lessons.length, 0);
  const completedLessons = progress?.completedLessons?.length || 0;
  const programPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const completedChallenges = enrollments.filter((e) => e.status === 'completed').length;

  const filteredLogs = practiceLogs.filter((l) =>
    filterType === 'all' ? true : l.type === filterType
  );

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Today&apos;s Duration</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{todayMinutes} min</p>
        </div>
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Weekly Yoga</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{weeklyYogaSessions}</p>
        </div>
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Monthly Meditation</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{monthlyMeditationSessions}</p>
        </div>
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Practice Streak</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{streak.current}d</p>
          <p className="mt-1 text-[11px] text-[#5B6860] tabular-nums dark:text-[#98A79E]">
            Longest: {streak.longest}d
          </p>
        </div>
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Learning &amp; Challenges</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{programPct}%</p>
          <p className="mt-1 text-[11px] text-[#5B6860] tabular-nums dark:text-[#98A79E]">
            {completedChallenges} challenges done
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <h2 className="font-display text-xl font-semibold">7-Day Practice Minutes &amp; Sessions</h2>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySeries}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#6D7A72" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6D7A72" width={32} />
              <Tooltip />
              <Bar dataKey="minutes" name="Minutes" fill="#2F5D46" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">Activity History</h3>
          <div className="flex items-center gap-1 rounded-lg bg-[#EFECE6] p-1 dark:bg-[#111915]">
            {(['all', 'yoga', 'meditation', 'breathing'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize ${
                  filterType === t
                    ? 'bg-white text-[#18221D] shadow-sm dark:bg-[#26352E] dark:text-[#EEF2EE]'
                    : 'text-[#526058] dark:text-[#A3B0A8]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="mt-4 text-sm text-[#526058] dark:text-[#A9B6AE]">
            No practice sessions recorded under this filter yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E2E6DF] text-xs text-[#5B6860] dark:border-[#24322B] dark:text-[#98A79E]">
                <tr>
                  <th className="py-2 pr-4 font-medium">Session</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 text-right font-medium">Duration</th>
                  <th className="py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6DF] dark:divide-[#24322B]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F7F4] dark:hover:bg-[#1A2620]">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{log.title}</p>
                      <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">{log.category}</p>
                    </td>
                    <td className="py-3 pr-4 capitalize text-xs">{log.type}</td>
                    <td className="py-3 pr-4 font-mono text-xs tabular-nums">{log.dateKey}</td>
                    <td className="py-3 pr-4 text-right font-mono text-xs tabular-nums">
                      {log.durationMinutes} min
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deletePracticeLog(log.id)}
                        aria-label="Delete practice log"
                        className="rounded p-1 text-[#78857D] hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
