import React, { useMemo } from 'react';
import { Award, Check } from 'lucide-react';
import { WELLNESS_CHALLENGES, ChallengeDefinition } from '../data/wellnessData';
import { useAuth } from '../context/AuthContext';

export const ChallengesPage: React.FC = () => {
  const { user, enrollments, customContent, enrollChallenge, toggleChallengeDay } = useAuth();

  const allChallenges = useMemo(() => {
    const custom: ChallengeDefinition[] = customContent
      .filter((c) => c.contentType === 'challenge')
      .map((c) => ({
        id: c.id,
        title: c.title,
        durationDays: Math.min(31, Math.max(3, c.durationMinutes)),
        category: c.category,
        badgeTitle: c.subtitle || 'FlowState Finisher',
        description: c.body,
        dailyPrompt: 'Complete today’s mindful check-in and practice block.',
      }));
    return [...WELLNESS_CHALLENGES, ...custom];
  }, [customContent]);

  const earnedBadges = enrollments
    .filter((e) => e.status === 'completed')
    .map((e) => {
      const def = allChallenges.find((c) => c.id === e.challengeId);
      return {
        id: e.id,
        title: def?.badgeTitle || 'Wellness Finisher',
        challengeTitle: e.title,
      };
    });

  return (
    <div className="space-y-8">
      {/* Earned Badges */}
      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-[#2F5D46] dark:text-[#84B89B]" />
          <h2 className="font-display text-xl font-semibold">Achievement Badges</h2>
        </div>
        {earnedBadges.length === 0 ? (
          <p className="mt-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
            Complete every day of an enrolled challenge to unlock its achievement badge.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {earnedBadges.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-[#2F5D46]/30 bg-[#F4F8F5] px-4 py-3 dark:border-[#84B89B]/30 dark:bg-[#1A2921]"
              >
                <p className="text-sm font-semibold text-[#2F5D46] dark:text-[#84B89B]">
                  {b.title}
                </p>
                <p className="text-xs text-[#526058] dark:text-[#A9B6AE]">
                  {b.challengeTitle}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Challenge Cards */}
      <section className="grid gap-6 md:grid-cols-2">
        {allChallenges.map((ch) => {
          const enrollment = enrollments.find((e) => e.challengeId === ch.id);
          const pct = enrollment
            ? Math.min(100, Math.round((enrollment.completedDays.length / ch.durationDays) * 100))
            : 0;

          return (
            <div
              key={ch.id}
              className="flex flex-col justify-between rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]"
            >
              <div>
                <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                  {ch.category} · <span className="tabular-nums">{ch.durationDays} days</span> · Badge: {ch.badgeTitle}
                </p>
                <h3 className="mt-1.5 font-display text-xl font-semibold">{ch.title}</h3>
                <p className="mt-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
                  {ch.description}
                </p>
                <p className="mt-3 rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-3 text-xs text-[#4A5750] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#B4C2BA]">
                  <strong>Daily Activity:</strong> {ch.dailyPrompt}
                </p>
              </div>

              <div className="mt-6">
                {!enrollment ? (
                  <button
                    type="button"
                    onClick={() => enrollChallenge(ch.id, ch.title, ch.durationDays)}
                    disabled={!user}
                    className="rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39] disabled:opacity-50"
                  >
                    {user ? 'Enroll in Challenge' : 'Sign in to Enroll'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">
                        {enrollment.status === 'completed'
                          ? 'Challenge Completed'
                          : 'Active Progress'}
                      </span>
                      <span className="font-mono tabular-nums">
                        {enrollment.completedDays.length}/{ch.durationDays} days ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#E6EAE4] dark:bg-[#24322B]">
                      <div
                        className="h-full bg-[#2F5D46] transition-all dark:bg-[#69A785]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Array.from({ length: ch.durationDays }, (_, i) => i + 1).map((day) => {
                        const done = enrollment.completedDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={enrollment.status === 'completed'}
                            onClick={() => toggleChallengeDay(enrollment, day)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs tabular-nums transition ${
                              done
                                ? 'bg-[#2F5D46] text-white'
                                : 'border border-[#D7DDD6] bg-[#F8F7F4] text-[#35423B] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#C0CDC5]'
                            } disabled:cursor-default`}
                            title={`Day ${day}`}
                          >
                            {done ? <Check className="h-3.5 w-3.5" /> : day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
