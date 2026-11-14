import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Heart, Pause, Play, RotateCcw, Search, Sparkles, X } from 'lucide-react';
import {
  YOGA_CATEGORIES,
  YOGA_POSES,
  YogaCategory,
  YogaPose,
} from '../data/wellnessData';
import { useAuth, getTodayKey } from '../context/AuthContext';
import { useCoachDrawer } from '../context/CoachDrawerContext';
import { ResilientImage } from '../components/ResilientImage';
import { ambientAudio } from '../utils/ambientAudio';

export const YogaStudioPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, progress, customContent, updateProgressFields, logPractice } = useAuth();
  const { openCoach } = useCoachDrawer();

  const [selectedCategory, setSelectedCategory] = useState<'All' | YogaCategory>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [search, setSearch] = useState('');
  const [activePose, setActivePose] = useState<YogaPose | null>(null);

  // Interactive Guided Asana Flow Player state
  const [cueIndex, setCueIndex] = useState(0);
  const [cueRemaining, setCueRemaining] = useState(0);
  const [playerRunning, setPlayerRunning] = useState(false);
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState('');

  // Merge built-in poses + admin-published custom asanas
  const allPoses = useMemo(() => {
    const customAsanas: YogaPose[] = customContent
      .filter((c) => c.contentType === 'asana')
      .map((c) => ({
        id: c.id,
        sanskritName: c.subtitle || c.title,
        englishName: c.title,
        image: YOGA_POSES[0].image,
        difficulty: (['Beginner', 'Intermediate', 'Advanced'].includes(c.difficulty)
          ? c.difficulty
          : 'Beginner') as YogaPose['difficulty'],
        durationMinutes: c.durationMinutes,
        categories: [
          (YOGA_CATEGORIES.includes(c.category as YogaCategory)
            ? c.category
            : 'Beginner Yoga') as YogaCategory,
        ],
        summary: c.body.slice(0, 140),
        steps: c.body.split('\n').filter(Boolean),
        breathingInstructions: 'Breathe slowly and steadily through the nose throughout each hold.',
        benefits: ['Added via FlowState Studio Curator'],
        precautions: ['Practice gently within a pain-free range of motion.'],
        commonMistakes: ['Holding the breath during effort.'],
        modifications: ['Use a folded blanket or yoga block as needed.'],
        relatedIds: ['tadasana', 'balasana'],
        guidedCues: [
          {
            phaseName: 'Mindful Hold',
            breath: 'Steady Breath',
            seconds: Math.max(20, c.durationMinutes * 15),
            cue: c.body.slice(0, 120),
          },
        ],
      }));
    return [...YOGA_POSES, ...customAsanas];
  }, [customContent]);

  useEffect(() => {
    const poseParam = searchParams.get('pose');
    if (poseParam) {
      const found = allPoses.find((p) => p.id === poseParam);
      if (found) openPoseDetail(found);
    }
  }, [searchParams, allPoses]);

  const openPoseDetail = (pose: YogaPose) => {
    setActivePose(pose);
    setCueIndex(0);
    setCueRemaining(pose.guidedCues[0]?.seconds || 30);
    setPlayerRunning(false);
    setSessionCompletedMsg('');
  };

  const closePoseDetail = () => {
    setActivePose(null);
    setPlayerRunning(false);
    if (searchParams.has('pose')) {
      searchParams.delete('pose');
      setSearchParams(searchParams, { replace: true });
    }
  };

  useEffect(() => {
    if (!playerRunning || !activePose) return;
    const interval = window.setInterval(() => {
      setCueRemaining((prev) => {
        if (prev > 1) return prev - 1;
        const nextIdx = cueIndex + 1;
        if (nextIdx < activePose.guidedCues.length) {
          ambientAudio.playChime(528, 1.8);
          setCueIndex(nextIdx);
          return activePose.guidedCues[nextIdx].seconds;
        }
        ambientAudio.playChime(432, 3.0);
        setPlayerRunning(false);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [playerRunning, cueIndex, activePose]);

  const favorites = progress?.favoritePoses || [];
  const completed = progress?.completedPoses || [];

  const filteredPoses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPoses.filter((p) => {
      if (selectedCategory !== 'All' && !p.categories.includes(selectedCategory)) return false;
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;
      if (onlyFavorites && !favorites.includes(p.id)) return false;
      if (
        q &&
        !p.englishName.toLowerCase().includes(q) &&
        !p.sanskritName.toLowerCase().includes(q) &&
        !p.summary.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [allPoses, selectedCategory, difficultyFilter, onlyFavorites, favorites, search]);

  const toggleFavorite = async (poseId: string) => {
    if (!user) return;
    const next = favorites.includes(poseId)
      ? favorites.filter((id) => id !== poseId)
      : [...favorites, poseId];
    await updateProgressFields({ favoritePoses: next });
  };

  const handleCompletePose = async (pose: YogaPose) => {
    if (!user) {
      setSessionCompletedMsg('Sign in with Google to save completed sessions to your history.');
      return;
    }
    const nextCompleted = completed.includes(pose.id)
      ? completed
      : [...completed, pose.id];
    await updateProgressFields({ completedPoses: nextCompleted });
    await logPractice({
      type: 'yoga',
      itemId: pose.id,
      title: `${pose.englishName} (${pose.sanskritName})`,
      category: pose.categories[0] || 'Yoga',
      durationMinutes: pose.durationMinutes,
      dateKey: getTodayKey(),
      notes: 'Completed guided posture flow',
    });
    setSessionCompletedMsg('Practice logged to your dashboard and progress history.');
  };

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#E2E6DF] bg-white p-6 sm:flex-row sm:items-center dark:border-[#24322B] dark:bg-[#16201B]">
        <div>
          <h2 className="font-display text-2xl font-semibold">Yoga Asana Studio</h2>
          <p className="mt-1 text-sm text-[#526058] dark:text-[#A9B6AE]">
            Explore {allPoses.length} guided postures with alignment notes, modifications, and interactive breath-timed practice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6D7A72]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Sanskrit or English..."
              className="w-56 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] py-2 pl-9 pr-3 text-sm text-[#18221D] placeholder:text-[#78857D] focus:border-[#2F5D46] focus:outline-none dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              openCoach({
                mode: 'yoga-coach',
                activeContext: 'Yoga Asana Studio',
              })
            }
            className="inline-flex items-center gap-2 rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39] whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Yoga Coach</span>
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-[#2F5D46] text-white'
                : 'bg-[#EFECE6] text-[#35423B] hover:bg-[#E2DFD7] dark:bg-[#19241E] dark:text-[#C0CDC5] dark:hover:bg-[#223029]'
            }`}
          >
            All Categories
          </button>
          {YOGA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#2F5D46] text-white'
                  : 'bg-[#EFECE6] text-[#35423B] hover:bg-[#E2DFD7] dark:bg-[#19241E] dark:text-[#C0CDC5] dark:hover:bg-[#223029]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-[#EFECE6] p-1 dark:bg-[#19241E]">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficultyFilter(lvl)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  difficultyFilter === lvl
                    ? 'bg-white text-[#18221D] shadow-sm dark:bg-[#26352E] dark:text-[#EEF2EE]'
                    : 'text-[#526058] hover:text-[#18221D] dark:text-[#A3B0A8] dark:hover:text-[#EEF2EE]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyFavorites((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              onlyFavorites
                ? 'border-[#2F5D46] bg-[#2F5D46] text-white'
                : 'border-[#D7DDD6] bg-white text-[#35423B] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#16201B] dark:text-[#C0CDC5]'
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Saved Favorites ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* Asana Grid */}
      {filteredPoses.length === 0 ? (
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-10 text-center dark:border-[#24322B] dark:bg-[#16201B]">
          <p className="text-sm font-medium">No poses matched your current filters.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setDifficultyFilter('All');
              setOnlyFavorites(false);
              setSearch('');
            }}
            className="mt-4 rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPoses.map((pose) => {
            const isFav = favorites.includes(pose.id);
            const isDone = completed.includes(pose.id);
            return (
              <div
                key={pose.id}
                className="flex flex-col overflow-hidden rounded-xl border border-[#E2E6DF] bg-white dark:border-[#24322B] dark:bg-[#16201B]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#EFECE6] dark:bg-[#1B2720]">
                  <ResilientImage
                    src={pose.image}
                    alt={`${pose.englishName} (${pose.sanskritName})`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#5B6860] dark:text-[#98A79E]">
                      <span>
                        {pose.sanskritName} · {pose.difficulty} ·{' '}
                        <span className="tabular-nums">{pose.durationMinutes} min</span>
                      </span>
                      {isDone && (
                        <span className="inline-flex items-center gap-1 font-medium text-[#2F5D46] dark:text-[#84B89B]">
                          <Check className="h-3.5 w-3.5" /> Practiced
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 text-lg font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                      {pose.englishName}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
                      {pose.summary}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
                    <button
                      type="button"
                      onClick={() => openPoseDetail(pose)}
                      className="rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39] whitespace-nowrap"
                    >
                      Guide &amp; Timer
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(pose.id)}
                      aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                      className={`rounded-lg border p-2 transition ${
                        isFav
                          ? 'border-[#2F5D46] bg-[#2F5D46]/10 text-[#2F5D46] dark:border-[#84B89B] dark:text-[#84B89B]'
                          : 'border-[#D7DDD6] text-[#5B6860] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#98A79E]'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pose Detail & Interactive Guided Flow Modal */}
      {activePose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#E2E6DF] bg-white p-6 sm:p-8 dark:border-[#2C3A33] dark:bg-[#16201B]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E6DF] pb-4 dark:border-[#24322B]">
              <div>
                <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                  {activePose.sanskritName} · {activePose.difficulty} · {activePose.durationMinutes} min
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold">
                  {activePose.englishName}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePoseDetail}
                aria-label="Close pose details"
                className="rounded-lg p-2 text-[#5B6860] hover:bg-[#EFECE6] dark:text-[#98A79E] dark:hover:bg-[#223029]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                <div className="aspect-[4/3] overflow-hidden rounded-xl border border-[#E2E6DF] dark:border-[#24322B]">
                  <ResilientImage
                    src={activePose.image}
                    alt={activePose.englishName}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Guided Asana Flow Player */}
                <div className="rounded-xl border border-[#E2E6DF] bg-[#F8F7F4] p-5 dark:border-[#2C3A33] dark:bg-[#111915]">
                  <div className="flex items-center justify-between text-xs text-[#5B6860] dark:text-[#98A79E]">
                    <span>Guided Flow Sequence</span>
                    <span className="font-mono tabular-nums">
                      Step {cueIndex + 1}/{activePose.guidedCues.length}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-semibold">
                    {activePose.guidedCues[cueIndex]?.phaseName}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                    Breath: {activePose.guidedCues[cueIndex]?.breath}
                  </p>
                  <p className="mt-2 text-sm text-[#4A5750] dark:text-[#B4C2BA]">
                    {activePose.guidedCues[cueIndex]?.cue}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-2xl font-semibold tabular-nums">
                      {cueRemaining}s
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPlayerRunning((r) => !r)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5D46] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#264C39]"
                      >
                        {playerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        <span>{playerRunning ? 'Pause' : 'Start Flow'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerRunning(false);
                          setCueIndex(0);
                          setCueRemaining(activePose.guidedCues[0]?.seconds || 30);
                        }}
                        aria-label="Reset pose timer"
                        className="rounded-lg border border-[#D7DDD6] p-2 text-[#4A5750] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#B4C2BA]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleCompletePose(activePose)}
                    className="flex-1 rounded-lg bg-[#18221D] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#27382F] dark:bg-[#2F5D46] dark:hover:bg-[#264C39]"
                  >
                    Complete &amp; Log Practice
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openCoach({
                        mode: 'yoga-coach',
                        activeContext: `Practicing ${activePose.englishName} (${activePose.sanskritName})`,
                        prompt: `Explain alignment, breath, and beginner modifications for ${activePose.englishName} (${activePose.sanskritName}).`,
                      })
                    }
                    className="rounded-lg border border-[#D7DDD6] px-3.5 py-2.5 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:hover:bg-[#223029]"
                  >
                    Ask AI Coach
                  </button>
                </div>

                {sessionCompletedMsg && (
                  <p className="text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                    {sessionCompletedMsg}
                  </p>
                )}
              </div>

              <div className="space-y-5 text-sm lg:col-span-7">
                <div>
                  <h4 className="font-semibold">Step-by-Step Instructions</h4>
                  <ol className="mt-2 space-y-1.5 text-[#4A5750] dark:text-[#B4C2BA]">
                    {activePose.steps.map((step, i) => (
                      <li key={i}>
                        <span className="font-mono text-xs text-[#2F5D46] dark:text-[#84B89B]">
                          0{i + 1}.
                        </span>{' '}
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
                  <h4 className="font-semibold">Breathing Instructions</h4>
                  <p className="mt-1 text-[#4A5750] dark:text-[#B4C2BA]">
                    {activePose.breathingInstructions}
                  </p>
                </div>

                <div className="grid gap-4 border-t border-[#E2E6DF] pt-4 sm:grid-cols-2 dark:border-[#24322B]">
                  <div>
                    <h4 className="font-semibold">Benefits</h4>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-[#4A5750] dark:text-[#B4C2BA]">
                      {activePose.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Precautions</h4>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-[#4A5750] dark:text-[#B4C2BA]">
                      {activePose.precautions.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-[#E2E6DF] pt-4 sm:grid-cols-2 dark:border-[#24322B]">
                  <div>
                    <h4 className="font-semibold">Common Mistakes</h4>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-[#4A5750] dark:text-[#B4C2BA]">
                      {activePose.commonMistakes.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Beginner Modifications</h4>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-[#4A5750] dark:text-[#B4C2BA]">
                      {activePose.modifications.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {activePose.relatedIds.length > 0 && (
                  <div className="border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
                    <h4 className="font-semibold">Related Poses</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activePose.relatedIds.map((rid) => {
                        const rel = allPoses.find((p) => p.id === rid);
                        if (!rel) return null;
                        return (
                          <button
                            key={rid}
                            type="button"
                            onClick={() => openPoseDetail(rel)}
                            className="rounded-lg border border-[#D7DDD6] px-3 py-1.5 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:hover:bg-[#223029]"
                          >
                            {rel.englishName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
