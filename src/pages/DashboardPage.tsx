import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Droplets, MessageSquare, Minus, Plus } from 'lucide-react';
import { useAuth, getTodayKey, MoodEntry } from '../context/AuthContext';
import { useCoachDrawer } from '../context/CoachDrawerContext';
import { YOGA_POSES, MEDITATION_SESSIONS } from '../data/wellnessData';
import { computeStreak, getLastNDaysSeries } from '../utils/metrics';
import { ResilientImage } from '../components/ResilientImage';

const QUICK_MOODS: MoodEntry['mood'][] = ['Happy', 'Calm', 'Neutral', 'Stressed', 'Tired', 'Anxious'];

export const DashboardPage: React.FC = () => {
  const {
    user,
    profile,
    progress,
    practiceLogs,
    moodEntries,
    enrollments,
    updateWaterIntake,
    logMood,
  } = useAuth();
  const { openCoach } = useCoachDrawer();
  const [moodSaving, setMoodSaving] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [coachQuestion, setCoachQuestion] = useState('');

  const todayKey = getTodayKey();
  const todayLogs = useMemo(
    () => practiceLogs.filter((l) => l.dateKey === todayKey),
    [practiceLogs, todayKey]
  );
  const todayMinutes = useMemo(
    () => todayLogs.reduce((sum, l) => sum + l.durationMinutes, 0),
    [todayLogs]
  );
  const streak = useMemo(() => computeStreak(practiceLogs), [practiceLogs]);
  const weeklySeries = useMemo(() => getLastNDaysSeries(practiceLogs, 7), [practiceLogs]);
  const todayMood = useMemo(
    () => moodEntries.find((m) => m.dateKey === todayKey) || null,
    [moodEntries, todayKey]
  );

  // Personalized recommendations derived from real user profile
  const recommendedPose = useMemo(() => {
    const level = profile?.experienceLevel || 'Beginner';
    const prefTime = profile?.preferredPracticeTime || 'Morning';
    const match = YOGA_POSES.find(
      (p) =>
        p.difficulty === level &&
        (prefTime === 'Evening' ? p.categories.includes('Evening Yoga') : p.categories.includes('Morning Yoga'))
    );
    return match || YOGA_POSES.find((p) => p.difficulty === level) || YOGA_POSES[0];
  }, [profile]);

  const recommendedMeditation = useMemo(() => {
    const latestMood = todayMood?.mood;
    if (latestMood === 'Stressed' || latestMood === 'Anxious') {
      return MEDITATION_SESSIONS.find((m) => m.category === 'Stress Relief') || MEDITATION_SESSIONS[0];
    }
    if (profile?.preferredPracticeTime === 'Evening') {
      return MEDITATION_SESSIONS.find((m) => m.category === 'Sleep') || MEDITATION_SESSIONS[2];
    }
    return MEDITATION_SESSIONS[0];
  }, [profile?.preferredPracticeTime, todayMood?.mood]);

  const activeReminders = (progress?.reminders || []).filter((r) => r.enabled);
  const waterCount = profile?.waterGlassesToday ?? 0;
  const waterGoal = profile?.waterGoal ?? 8;

  const handleQuickMood = async (mood: MoodEntry['mood']) => {
    if (!user) return;
    setMoodSaving(mood);
    try {
      await logMood({
        mood,
        energyLevel: mood === 'Happy' || mood === 'Calm' ? 4 : mood === 'Tired' ? 2 : 3,
        dateKey: todayKey,
        note: 'Logged from Dashboard quick check-in',
      });
      setStatusNote(`Mood recorded as ${mood}.`);
    } finally {
      setMoodSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 sm:p-8 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#18221D] sm:text-3xl dark:text-[#EEF2EE]">
              Welcome back, {profile?.displayName || user?.displayName || 'Practitioner'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#526058] dark:text-[#A9B6AE]">
              {todayLogs.length > 0
                ? `You have logged ${todayLogs.length} session${todayLogs.length > 1 ? 's' : ''} (${todayMinutes} minutes) today.`
                : 'No practice logged yet today. Choose a 5-minute breath reset or guided yoga posture below.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/planner"
              className="rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39] whitespace-nowrap"
            >
              Today&apos;s Plan
            </Link>
            <Link
              to="/breathing"
              className="rounded-lg border border-[#CFD6CE] px-4 py-2 text-xs font-medium text-[#18221D] hover:bg-[#EFECE6] whitespace-nowrap dark:border-[#2C3A33] dark:text-[#EEF2EE] dark:hover:bg-[#1E2A23]"
            >
              5-Min Breath
            </Link>
          </div>
        </div>
      </section>

      {/* Real KPI Row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Current Streak</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#18221D] dark:text-[#EEF2EE]">
            {streak.current} {streak.current === 1 ? 'day' : 'days'}
          </p>
          <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
            Best: <span className="tabular-nums">{streak.longest} days</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Today&apos;s Practice</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#18221D] dark:text-[#EEF2EE]">
            {todayMinutes} min
          </p>
          <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
            Goal: <span className="tabular-nums">{profile?.availableMinutes ?? 20} min</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Total Sessions</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#18221D] dark:text-[#EEF2EE]">
            {practiceLogs.length}
          </p>
          <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
            Recorded in Firestore
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Water Intake</p>
            <Droplets className="h-4 w-4 text-[#2F5D46] dark:text-[#84B89B]" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#18221D] dark:text-[#EEF2EE]">
            {waterCount} / {waterGoal}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateWaterIntake(Math.max(0, waterCount - 1))}
              aria-label="Decrease water glasses"
              className="rounded-md border border-[#CFD6CE] p-1 text-[#18221D] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#EEF2EE] dark:hover:bg-[#1E2A23]"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateWaterIntake(waterCount + 1)}
              aria-label="Increase water glasses"
              className="rounded-md bg-[#2F5D46] p-1 text-white hover:bg-[#264C39]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-[#5B6860] dark:text-[#98A79E]">glasses today</span>
          </div>
        </div>
      </section>

      {/* Recommendations + Weekly Chart */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-lg font-semibold">Today&apos;s Recommendations</h3>
              <span className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                Tailored to {profile?.experienceLevel || 'Beginner'} · {profile?.preferredPracticeTime || 'Morning'}
              </span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Link
                to={`/yoga?pose=${recommendedPose.id}`}
                className="group overflow-hidden rounded-lg border border-[#E2E6DF] transition hover:border-[#2F5D46]/50 dark:border-[#24322B]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#EFECE6] dark:bg-[#1B2720]">
                  <ResilientImage
                    src={recommendedPose.image}
                    alt={recommendedPose.englishName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                    Yoga · {recommendedPose.durationMinutes} min
                  </p>
                  <p className="mt-1 font-semibold text-[#18221D] group-hover:text-[#2F5D46] dark:text-[#EEF2EE] dark:group-hover:text-[#84B89B]">
                    {recommendedPose.englishName}
                  </p>
                  <p className="mt-1 text-xs text-[#526058] dark:text-[#A9B6AE]">
                    {recommendedPose.sanskritName}
                  </p>
                </div>
              </Link>

              <Link
                to={`/meditation?session=${recommendedMeditation.id}`}
                className="group overflow-hidden rounded-lg border border-[#E2E6DF] transition hover:border-[#2F5D46]/50 dark:border-[#24322B]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#EFECE6] dark:bg-[#1B2720]">
                  <ResilientImage
                    src={recommendedMeditation.image}
                    alt={recommendedMeditation.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                    Meditation · {recommendedMeditation.durationMinutes} min
                  </p>
                  <p className="mt-1 font-semibold text-[#18221D] group-hover:text-[#2F5D46] dark:text-[#EEF2EE] dark:group-hover:text-[#84B89B]">
                    {recommendedMeditation.title}
                  </p>
                  <p className="mt-1 text-xs text-[#526058] dark:text-[#A9B6AE]">
                    {recommendedMeditation.category}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Weekly Practice Chart */}
          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">7-Day Practice Minutes</h3>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#2F5D46] hover:underline dark:text-[#84B89B]"
              >
                <span>Full Analytics</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySeries}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#6D7A72" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6D7A72" width={32} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #D7DDD6',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="minutes" fill="#2F5D46" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Mood, Active Challenges, Reminders, AI Suggestion */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Quick Mood Check-In</h3>
              <Link to="/mood" className="text-xs font-medium text-[#2F5D46] hover:underline dark:text-[#84B89B]">
                Mood History
              </Link>
            </div>
            <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
              {todayMood
                ? `Latest today: ${todayMood.mood} (Energy ${todayMood.energyLevel}/5)`
                : 'Select how you feel right now for reflective tracking.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleQuickMood(m)}
                  disabled={moodSaving !== null}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    todayMood?.mood === m
                      ? 'border-[#2F5D46] bg-[#2F5D46] text-white'
                      : 'border-[#D7DDD6] bg-[#F8F7F4] text-[#18221D] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE] dark:hover:bg-[#223029]'
                  }`}
                >
                  {moodSaving === m ? 'Saving...' : m}
                </button>
              ))}
            </div>
            {statusNote && (
              <p className="mt-3 text-xs text-[#2F5D46] dark:text-[#84B89B]">{statusNote}</p>
            )}
          </div>

          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Wellness Goals &amp; Challenges</h3>
              <Link to="/challenges" className="text-xs font-medium text-[#2F5D46] hover:underline dark:text-[#84B89B]">
                View All
              </Link>
            </div>
            <p className="mt-2 text-xs text-[#5B6860] dark:text-[#98A79E]">
              Active Goals: {(profile?.primaryGoals || ['Stress Relief']).join(' · ')}
            </p>
            {enrollments.length === 0 ? (
              <p className="mt-4 text-sm text-[#526058] dark:text-[#A9B6AE]">
                No challenges enrolled yet. Join a 7-Day Yoga or 21-Day Mindfulness Reset.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {enrollments.slice(0, 2).map((en) => {
                  const pct = Math.min(
                    100,
                    Math.round((en.completedDays.length / en.durationDays) * 100)
                  );
                  return (
                    <div key={en.id} className="border-t border-[#E2E6DF] pt-3 dark:border-[#24322B]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{en.title}</span>
                        <span className="font-mono tabular-nums">
                          {en.completedDays.length}/{en.durationDays} days
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E6EAE4] dark:bg-[#24322B]">
                        <div
                          className="h-full bg-[#2F5D46] dark:bg-[#69A785]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">AI Coach &amp; Quick Chat</h3>
              <Link to="/assistant" className="text-xs font-medium text-[#2F5D46] hover:underline dark:text-[#84B89B]">
                Full Thread
              </Link>
            </div>
            <p className="mt-1.5 text-xs text-[#5B6860] dark:text-[#98A79E]">
              Ask for posture alignment, breath resets, or routines tailored to your {profile?.experienceLevel || 'Beginner'} level.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!coachQuestion.trim()) return;
                openCoach({
                  mode: 'yoga-coach',
                  prompt: coachQuestion.trim(),
                  activeContext: 'Wellness Dashboard',
                  autoSend: true,
                });
                setCoachQuestion('');
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={coachQuestion}
                onChange={(e) => setCoachQuestion(e.target.value)}
                placeholder="Ask AI Coach a question..."
                className="min-w-0 flex-1 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-xs text-[#18221D] placeholder:text-[#78857D] focus:border-[#2F5D46] focus:outline-none dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5D46] px-3 py-2 text-xs font-medium text-white hover:bg-[#264C39] whitespace-nowrap shrink-0"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat</span>
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  openCoach({
                    mode: 'yoga-coach',
                    prompt: `Design a ${profile?.availableMinutes || 15}-minute yoga flow for my ${profile?.experienceLevel || 'Beginner'} level.`,
                    activeContext: 'Wellness Dashboard',
                    autoSend: true,
                  })
                }
                className="rounded-lg border border-[#D7DDD6] px-2.5 py-1.5 text-xs text-[#35423B] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#C8D3CC] dark:hover:bg-[#1E2A23]"
              >
                Today&apos;s Yoga Sequence
              </button>
              <button
                type="button"
                onClick={() =>
                  openCoach({
                    mode: 'assistant',
                    prompt: todayMood
                      ? `I logged my mood as ${todayMood.mood}. Suggest a calming breath or meditation reset.`
                      : 'Suggest a calming 5-minute stress and posture reset.',
                    activeContext: 'Wellness Dashboard',
                    autoSend: true,
                  })
                }
                className="rounded-lg border border-[#D7DDD6] px-2.5 py-1.5 text-xs text-[#35423B] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#C8D3CC] dark:hover:bg-[#1E2A23]"
              >
                Mood-Aware Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Upcoming Reminders</h3>
              <Link to="/reminders" className="text-xs font-medium text-[#2F5D46] hover:underline dark:text-[#84B89B]">
                Configure
              </Link>
            </div>
            {activeReminders.length === 0 ? (
              <p className="mt-3 text-sm text-[#526058] dark:text-[#A9B6AE]">
                Reminders are paused. Enable hydration or practice alerts in Reminders.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[#E2E6DF] text-sm dark:divide-[#24322B]">
                {activeReminders.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2">
                    <span>{r.label}</span>
                    <span className="font-mono text-xs tabular-nums text-[#5B6860] dark:text-[#98A79E]">
                      {r.time}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
