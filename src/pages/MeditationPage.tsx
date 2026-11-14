import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, Music, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { MEDITATION_SESSIONS, MeditationSession } from '../data/wellnessData';
import { useAuth, getTodayKey } from '../context/AuthContext';
import { ambientAudio, SoundscapeType } from '../utils/ambientAudio';
import { ResilientImage } from '../components/ResilientImage';

const INDIAN_SOUNDSCAPES: { id: SoundscapeType; label: string }[] = [
  { id: 'raga-yaman', label: 'Raga Yaman Bansuri' },
  { id: 'tanpura-drone', label: 'Tanpura Sa-Pa Drone' },
  { id: 'raga-bhairav', label: 'Raga Bhairav Dawn' },
  { id: 'santoor-calm', label: 'Santoor Raga Bhopali' },
  { id: 'om-drone', label: '136.1 Hz Om Nada' },
];

const AMBIENT_SOUNDSCAPES: { id: SoundscapeType; label: string }[] = [
  { id: 'singing-bowl', label: 'Singing Bowl' },
  { id: 'rain', label: 'Soft Rain' },
  { id: 'forest', label: 'Forest Breeze' },
  { id: 'silence', label: 'Pure Silence' },
];

const ALL_SOUNDSCAPES = [...INDIAN_SOUNDSCAPES, ...AMBIENT_SOUNDSCAPES];

const CATEGORIES = [
  'All',
  'Guided Meditation',
  'Mindfulness',
  'Sleep',
  'Stress Relief',
  'Breathing',
  'Body Scan',
  'Relaxation',
  'Focus',
] as const;

export const MeditationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, progress, practiceLogs, customContent, updateProgressFields, logPractice } = useAuth();

  const allSessions = useMemo(() => {
    const customMeditations: MeditationSession[] = customContent
      .filter((c) => c.contentType === 'meditation')
      .map((c) => ({
        id: c.id,
        title: c.title,
        category: 'Mindfulness',
        durationMinutes: c.durationMinutes,
        image: MEDITATION_SESSIONS[0].image,
        defaultSoundscape: 'singing-bowl',
        description: c.subtitle || c.body.slice(0, 140),
        guidancePrompts: c.body.split('\n').filter(Boolean),
      }));
    return [...MEDITATION_SESSIONS, ...customMeditations];
  }, [customContent]);

  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [selectedSession, setSelectedSession] = useState<MeditationSession>(allSessions[0]);
  const [durationMinutes, setDurationMinutes] = useState(allSessions[0].durationMinutes);
  const [soundscape, setSoundscape] = useState<SoundscapeType>(allSessions[0].defaultSoundscape);
  const [volume, setVolume] = useState(0.35);
  const [secondsLeft, setSecondsLeft] = useState(allSessions[0].durationMinutes * 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const paramId = searchParams.get('session');
    if (paramId) {
      const found = allSessions.find((s) => s.id === paramId);
      if (found) selectSession(found);
    }
  }, [searchParams, allSessions]);

  const selectSession = (session: MeditationSession) => {
    ambientAudio.stop();
    setIsPlaying(false);
    setIsPreviewing(false);
    setSelectedSession(session);
    setDurationMinutes(session.durationMinutes);
    setSoundscape(session.defaultSoundscape);
    setSecondsLeft(session.durationMinutes * 60);
    setStatusMessage('');
  };

  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  useEffect(() => {
    ambientAudio.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        ambientAudio.stop();
        ambientAudio.playChime(432, 3.5);
        setIsPlaying(false);
        setIsPreviewing(false);
        handleRecordCompletion(selectedSession, durationMinutes);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, selectedSession, durationMinutes]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      ambientAudio.stop();
      setIsPlaying(false);
      setIsPreviewing(false);
    } else {
      if (secondsLeft === 0) {
        setSecondsLeft(durationMinutes * 60);
      }
      ambientAudio.startSoundscape(soundscape, volume);
      setIsPreviewing(false);
      setIsPlaying(true);
      setStatusMessage('');
    }
  };

  const handleReset = () => {
    ambientAudio.stop();
    setIsPlaying(false);
    setIsPreviewing(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const handleChangeDuration = (mins: number) => {
    ambientAudio.stop();
    setIsPlaying(false);
    setIsPreviewing(false);
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleChangeSoundscape = (type: SoundscapeType) => {
    setSoundscape(type);
    if (isPlaying || isPreviewing) {
      if (type === 'silence') {
        ambientAudio.stop();
        setIsPreviewing(false);
      } else {
        ambientAudio.startSoundscape(type, volume);
      }
    }
  };

  const handleTogglePreview = () => {
    if (isPlaying) return;
    if (isPreviewing) {
      ambientAudio.stop();
      setIsPreviewing(false);
    } else {
      const targetType = soundscape === 'silence' ? 'tanpura-drone' : soundscape;
      if (soundscape === 'silence') setSoundscape('tanpura-drone');
      ambientAudio.startSoundscape(targetType, volume);
      setIsPreviewing(true);
    }
  };

  const handleRecordCompletion = async (session: MeditationSession, mins: number) => {
    if (!user) {
      setStatusMessage('Session complete. Sign in with Google to save meditation history.');
      return;
    }
    await logPractice({
      type: 'meditation',
      itemId: session.id,
      title: session.title,
      category: session.category,
      durationMinutes: mins,
      dateKey: getTodayKey(),
      notes: `Soundscape: ${soundscape}`,
    });
    setStatusMessage('Meditation session completed and saved to your history.');
  };

  const favorites = progress?.favoriteMeditations || [];
  const toggleFavorite = async (id: string) => {
    if (!user) return;
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    await updateProgressFields({ favoriteMeditations: next });
  };

  const filteredSessions = allSessions.filter((s) =>
    category === 'All' ? true : s.category === category
  );
  const meditationHistory = practiceLogs.filter((l) => l.type === 'meditation');

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-8">
      {/* Active Player Studio */}
      <section className="grid gap-6 rounded-2xl border border-[#E2E6DF] bg-white p-6 lg:grid-cols-12 lg:p-8 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="lg:col-span-5">
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-[#E2E6DF] dark:border-[#24322B]">
            <ResilientImage
              src={selectedSession.image}
              alt={selectedSession.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4 space-y-2 text-xs text-[#526058] dark:text-[#A9B6AE]">
            <p className="font-semibold text-[#18221D] dark:text-[#EEF2EE]">Guided Cues</p>
            {selectedSession.guidancePrompts.map((p, i) => (
              <p key={i}>
                <span className="font-mono text-[#2F5D46] dark:text-[#84B89B]">0{i + 1}.</span> {p}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-6 lg:col-span-7">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                  {selectedSession.category} · Audio: {ALL_SOUNDSCAPES.find((s) => s.id === soundscape)?.label}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {selectedSession.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => toggleFavorite(selectedSession.id)}
                aria-label="Favorite meditation session"
                className={`rounded-lg border p-2 ${
                  favorites.includes(selectedSession.id)
                    ? 'border-[#2F5D46] text-[#2F5D46] dark:border-[#84B89B] dark:text-[#84B89B]'
                    : 'border-[#D7DDD6] text-[#5B6860] dark:border-[#2C3A33]'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${
                    favorites.includes(selectedSession.id) ? 'fill-current' : ''
                  }`}
                />
              </button>
            </div>
            <p className="mt-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
              {selectedSession.description}
            </p>
          </div>

          {/* Timer & Controls */}
          <div className="rounded-xl border border-[#E2E6DF] bg-[#F8F7F4] p-5 dark:border-[#2C3A33] dark:bg-[#111915]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">Remaining Time</p>
                <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight">
                  {mm}:{ss}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2F5D46] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#264C39]"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isPlaying ? 'Pause' : 'Begin Sit'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset meditation timer"
                  className="rounded-lg border border-[#D7DDD6] bg-white p-2.5 text-[#35423B] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE]"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRecordCompletion(selectedSession, durationMinutes)}
                  className="rounded-lg border border-[#D7DDD6] bg-white px-3 py-2.5 text-xs font-medium text-[#18221D] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE]"
                >
                  Log Complete
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-[#E2E6DF] pt-4 sm:grid-cols-2 dark:border-[#24322B]">
              <div>
                <p className="text-xs font-medium text-[#5B6860] dark:text-[#98A79E]">
                  Duration
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[5, 10, 15, 20].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleChangeDuration(m)}
                      className={`rounded-md px-3 py-1 font-mono text-xs tabular-nums ${
                        durationMinutes === m
                          ? 'bg-[#2F5D46] text-white'
                          : 'bg-white text-[#35423B] border border-[#D7DDD6] dark:bg-[#19241E] dark:border-[#2C3A33] dark:text-[#C0CDC5]'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#5B6860] dark:text-[#98A79E]">
                    Ambient Audio Volume
                  </p>
                  <Volume2 className="h-3.5 w-3.5 text-[#5B6860]" />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Ambient audio volume"
                  className="mt-2 w-full accent-[#2F5D46]"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-[#5B6860] dark:text-[#98A79E]">
                  Indian Classical Meditation Music
                </p>
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={handleTogglePreview}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      isPreviewing
                        ? 'border-[#2F5D46] bg-[#2F5D46] text-white'
                        : 'border-[#D7DDD6] bg-white text-[#18221D] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE]'
                    }`}
                  >
                    <Music className="h-3.5 w-3.5" />
                    <span>{isPreviewing ? 'Stop Audio Preview' : 'Preview Music'}</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INDIAN_SOUNDSCAPES.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleChangeSoundscape(sc.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                      soundscape === sc.id
                        ? 'bg-[#18221D] text-white dark:bg-[#2F5D46]'
                        : 'border border-[#D7DDD6] bg-white text-[#35423B] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#C0CDC5]'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              <div>
                <p className="text-xs font-medium text-[#5B6860] dark:text-[#98A79E]">
                  Nature &amp; Tibetan Bowls
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {AMBIENT_SOUNDSCAPES.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleChangeSoundscape(sc.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                        soundscape === sc.id
                          ? 'bg-[#18221D] text-white dark:bg-[#2F5D46]'
                          : 'border border-[#D7DDD6] bg-white text-[#35423B] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#C0CDC5]'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {statusMessage && (
              <p className="mt-3 text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                {statusMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Session Library */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold">Meditation Library</h3>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  category === cat
                    ? 'bg-[#2F5D46] text-white'
                    : 'bg-[#EFECE6] text-[#35423B] dark:bg-[#19241E] dark:text-[#C0CDC5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredSessions.map((session) => {
            const active = session.id === selectedSession.id;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => selectSession(session)}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                  active
                    ? 'border-[#2F5D46] bg-[#F4F8F5] dark:border-[#84B89B] dark:bg-[#1A2921]'
                    : 'border-[#E2E6DF] bg-white hover:border-[#2F5D46]/40 dark:border-[#24322B] dark:bg-[#16201B]'
                }`}
              >
                <div>
                  <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                    {session.category} · <span className="tabular-nums">{session.durationMinutes} min</span>
                  </p>
                  <p className="mt-1.5 text-sm font-semibold">{session.title}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-[#526058] dark:text-[#A9B6AE]">
                    {session.description}
                  </p>
                </div>
                <span className="mt-4 text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                  {active ? 'Loaded in Studio' : 'Load Session'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Meditation History */}
      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <h3 className="font-display text-lg font-semibold">Recent Meditation History</h3>
        {meditationHistory.length === 0 ? (
          <p className="mt-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
            Complete a meditation sit above to see your recorded sessions here.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[#E2E6DF] text-sm dark:divide-[#24322B]">
            {meditationHistory.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                    {item.category} · {item.dateKey}
                  </p>
                </div>
                <span className="font-mono text-xs tabular-nums">
                  {item.durationMinutes} min
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
