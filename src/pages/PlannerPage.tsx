import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, RefreshCw, Share2, SkipForward, Sparkles, Trash2 } from 'lucide-react';
import { DailyPlan, DailyPlanItem, getTodayKey, useAuth } from '../context/AuthContext';

function buildStructuredPlan(
  goal: string,
  minutes: number,
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  preferredTime: string
): DailyPlanItem[] {
  const yogaMins = Math.max(10, Math.round(minutes * 0.5));
  const medMins = Math.max(5, Math.round(minutes * 0.3));
  const breathMins = Math.max(3, minutes - yogaMins - medMins);

  return [
    {
      id: `item-${Date.now()}-1`,
      timeSlot: '07:15 AM',
      category: 'Morning Routine',
      title: 'Warm Water & Gentle Neck Mobility',
      durationMinutes: 5,
      description: 'Hydrate with 1 glass of water and roll shoulders slowly before checking messages.',
      status: 'pending',
    },
    {
      id: `item-${Date.now()}-2`,
      timeSlot: preferredTime === 'Evening' ? '06:00 PM' : preferredTime === 'Midday' ? '12:30 PM' : '07:30 AM',
      category: 'Yoga',
      title: `${level} Sequence for ${goal}`,
      durationMinutes: yogaMins,
      description: 'Flow through Cat-Cow, Mountain Pose, Warrior II, and Child’s Pose at a steady nasal pace.',
      status: 'pending',
    },
    {
      id: `item-${Date.now()}-3`,
      timeSlot: '01:00 PM',
      category: 'Hydration',
      title: 'Midday Hydration & Posture Reset',
      durationMinutes: 2,
      description: 'Drink 2 glasses of water and stand tall in Tadasana for 60 seconds away from your desk.',
      status: 'pending',
    },
    {
      id: `item-${Date.now()}-4`,
      timeSlot: '03:30 PM',
      category: 'Breathing',
      title: 'Box or Resonant Breath Reset',
      durationMinutes: breathMins,
      description: 'Complete 6 calm breath cycles in the Breathing Studio to clear afternoon fatigue.',
      status: 'pending',
    },
    {
      id: `item-${Date.now()}-5`,
      timeSlot: '08:30 PM',
      category: 'Meditation',
      title: 'Guided Body Scan Sit',
      durationMinutes: medMins,
      description: 'Practice quiet mindfulness with soft rain or singing bowl soundscape.',
      status: 'pending',
    },
    {
      id: `item-${Date.now()}-6`,
      timeSlot: '09:45 PM',
      category: 'Evening Wind-Down',
      title: 'Screen Dimming & Savasana Rest',
      durationMinutes: 5,
      description: 'Dim lights and rest in Legs-Up-the-Wall or Savasana before sleep.',
      status: 'pending',
    },
  ];
}

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, moodEntries, dailyPlans, saveDailyPlan, deleteDailyPlan } = useAuth();

  const [goal, setGoal] = useState(profile?.primaryGoals?.[0] || 'Stress Relief & Flexibility');
  const [availableMinutes, setAvailableMinutes] = useState(profile?.availableMinutes || 30);
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    profile?.experienceLevel || 'Beginner'
  );
  const [preferredTime, setPreferredTime] = useState<'Morning' | 'Midday' | 'Evening' | 'Flexible'>(
    profile?.preferredPracticeTime || 'Morning'
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customTime, setCustomTime] = useState('05:00 PM');

  const todayKey = getTodayKey();
  const activePlan: DailyPlan | null = useMemo(() => {
    if (selectedPlanId) {
      return dailyPlans.find((p) => p.id === selectedPlanId) || dailyPlans[0] || null;
    }
    return dailyPlans.find((p) => p.dateKey === todayKey) || dailyPlans[0] || null;
  }, [dailyPlans, selectedPlanId, todayKey]);

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    setNotice('');

    let items: DailyPlanItem[] | null = null;
    try {
      const resp = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          availableMinutes,
          experienceLevel,
          preferredTime,
          recentMood: moodEntries[0]?.mood,
        }),
      });
      const data = await resp.json();
      if (resp.ok && Array.isArray(data.items) && data.items.length > 0) {
        items = data.items.map((it: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          timeSlot: String(it.timeSlot || '08:00 AM').slice(0, 20),
          category: String(it.category || 'Wellness').slice(0, 40),
          title: String(it.title || 'Practice Block').slice(0, 120),
          durationMinutes: Math.max(1, Number(it.durationMinutes) || 10),
          description: String(it.description || '').slice(0, 260),
          status: 'pending' as const,
        }));
        setNotice('Personalized schedule generated with Gemini AI.');
      }
    } catch {
      // Fall back to deterministic template if AI endpoint unavailable
    }

    if (!items) {
      items = buildStructuredPlan(goal, availableMinutes, experienceLevel, preferredTime);
      setNotice('Created structured daily schedule using FlowState template (AI service unavailable).');
    }

    const existingToday = dailyPlans.find((p) => p.dateKey === todayKey);
    const savedId = await saveDailyPlan(
      {
        dateKey: todayKey,
        goal,
        availableMinutes,
        experienceLevel,
        preferredTime,
        items,
      },
      existingToday?.id
    );
    if (savedId) setSelectedPlanId(savedId);
    setGenerating(false);
  };

  const updateItemStatus = async (itemId: string, nextStatus: 'pending' | 'completed' | 'skipped') => {
    if (!activePlan) return;
    const nextItems = activePlan.items.map((it) =>
      it.id === itemId ? { ...it, status: nextStatus } : it
    );
    await saveDailyPlan(
      {
        dateKey: activePlan.dateKey,
        goal: activePlan.goal,
        availableMinutes: activePlan.availableMinutes,
        experienceLevel: activePlan.experienceLevel,
        preferredTime: activePlan.preferredTime,
        items: nextItems,
      },
      activePlan.id
    );
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan || !customTitle.trim()) return;
    if (activePlan.items.length >= 12) {
      setNotice('Maximum of 12 activities per daily plan reached.');
      return;
    }
    const newItem: DailyPlanItem = {
      id: `custom-${Date.now()}`,
      timeSlot: customTime.trim() || '05:00 PM',
      category: 'Custom',
      title: customTitle.trim().slice(0, 120),
      durationMinutes: 10,
      description: 'Personal wellness addition',
      status: 'pending',
    };
    await saveDailyPlan(
      {
        dateKey: activePlan.dateKey,
        goal: activePlan.goal,
        availableMinutes: activePlan.availableMinutes,
        experienceLevel: activePlan.experienceLevel,
        preferredTime: activePlan.preferredTime,
        items: [...activePlan.items, newItem],
      },
      activePlan.id
    );
    setCustomTitle('');
  };

  const handleShareToChat = () => {
    if (!activePlan) return;
    const summary = `FlowState Daily Plan (${activePlan.dateKey}) — Goal: ${activePlan.goal}\n` +
      activePlan.items
        .map((it) => `• ${it.timeSlot} [${it.status.toUpperCase()}] ${it.title} (${it.durationMinutes}m)`)
        .join('\n');
    navigate(`/chat?draft=${encodeURIComponent(summary)}`);
  };

  const completedCount = activePlan
    ? activePlan.items.filter((i) => i.status === 'completed').length
    : 0;

  return (
    <div className="space-y-8">
      {/* Generator Controls */}
      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Daily Wellness Planner</h2>
            <p className="mt-1 text-sm text-[#526058] dark:text-[#A9B6AE]">
              Generate a balanced schedule covering morning mobility, yoga, breathwork, hydration, meditation, and evening rest.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2F5D46] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#264C39] disabled:opacity-60 whitespace-nowrap"
          >
            {activePlan ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>{generating ? 'Designing Plan...' : activePlan ? 'Regenerate Today’s Plan' : 'Generate Daily Plan'}</span>
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Primary Goal
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
            />
          </label>

          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Dedicated Time (min)
            <input
              type="number"
              min={10}
              max={180}
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(Math.max(10, Number(e.target.value)))}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
            />
          </label>

          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Experience Level
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>

          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Preferred Practice Time
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
            >
              <option value="Morning">Morning</option>
              <option value="Midday">Midday</option>
              <option value="Evening">Evening</option>
              <option value="Flexible">Flexible</option>
            </select>
          </label>
        </div>

        {notice && (
          <p className="mt-4 text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
            {notice}
          </p>
        )}
      </section>

      {/* Active Plan Timeline & History */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 lg:col-span-8 dark:border-[#24322B] dark:bg-[#16201B]">
          {!activePlan ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#526058] dark:text-[#A9B6AE]">
                No daily wellness plan saved yet. Click &ldquo;Generate Daily Plan&rdquo; above to create one.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E6DF] pb-4 dark:border-[#24322B]">
                <div>
                  <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                    {activePlan.dateKey} · {activePlan.experienceLevel} ·{' '}
                    <span className="tabular-nums">
                      {completedCount}/{activePlan.items.length} completed
                    </span>
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    {activePlan.goal}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleShareToChat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7DDD6] px-3 py-2 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:hover:bg-[#223029]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share to Google Chat</span>
                </button>
              </div>

              <div className="mt-4 divide-y divide-[#E2E6DF] dark:divide-[#24322B]">
                {activePlan.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                        <span className="font-mono tabular-nums">{item.timeSlot}</span> ·{' '}
                        {item.category} ·{' '}
                        <span className="tabular-nums">{item.durationMinutes} min</span>
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          item.status === 'completed'
                            ? 'line-through opacity-60'
                            : item.status === 'skipped'
                            ? 'opacity-50'
                            : ''
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-[#526058] dark:text-[#A9B6AE]">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateItemStatus(
                            item.id,
                            item.status === 'completed' ? 'pending' : 'completed'
                          )
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                          item.status === 'completed'
                            ? 'bg-[#2F5D46] text-white'
                            : 'border border-[#D7DDD6] text-[#18221D] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#EEF2EE]'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{item.status === 'completed' ? 'Done' : 'Complete'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateItemStatus(
                            item.id,
                            item.status === 'skipped' ? 'pending' : 'skipped'
                          )
                        }
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs ${
                          item.status === 'skipped'
                            ? 'border-amber-600 text-amber-700 dark:text-amber-300'
                            : 'border-[#D7DDD6] text-[#5B6860] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#98A79E]'
                        }`}
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                        <span>{item.status === 'skipped' ? 'Skipped' : 'Skip'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddCustomItem}
                className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]"
              >
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="05:00 PM"
                  className="w-28 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-xs dark:border-[#2C3A33] dark:bg-[#111915]"
                />
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Add custom routine activity..."
                  className="min-w-[180px] flex-1 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-xs dark:border-[#2C3A33] dark:bg-[#111915]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#18221D] px-3 py-2 text-xs font-medium text-white dark:bg-[#2F5D46]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Block</span>
                </button>
              </form>
            </>
          )}
        </section>

        {/* Previous Plans */}
        <aside className="rounded-xl border border-[#E2E6DF] bg-white p-5 lg:col-span-4 dark:border-[#24322B] dark:bg-[#16201B]">
          <h3 className="font-display text-lg font-semibold">Saved Plans</h3>
          {dailyPlans.length === 0 ? (
            <p className="mt-3 text-xs text-[#5B6860] dark:text-[#98A79E]">
              Previous daily schedules will appear here.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {dailyPlans.map((pl) => (
                <div
                  key={pl.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border p-3 text-xs ${
                    activePlan?.id === pl.id
                      ? 'border-[#2F5D46] bg-[#F4F8F5] dark:border-[#84B89B] dark:bg-[#1A2921]'
                      : 'border-[#E2E6DF] dark:border-[#24322B]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPlanId(pl.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="font-mono text-[11px] text-[#5B6860] dark:text-[#98A79E]">
                      {pl.dateKey}
                    </p>
                    <p className="truncate font-semibold">{pl.goal}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDailyPlan(pl.id)}
                    aria-label="Delete saved plan"
                    className="rounded p-1 text-[#78857D] hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
