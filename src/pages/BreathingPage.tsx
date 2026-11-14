import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { BREATHING_PROTOCOLS, BreathingProtocol } from '../data/wellnessData';
import { useAuth, getTodayKey } from '../context/AuthContext';
import { ambientAudio } from '../utils/ambientAudio';

type BreathPhase = 'Inhale' | 'Hold In' | 'Exhale' | 'Hold Out';

export const BreathingPage: React.FC = () => {
  const { user, logPractice } = useAuth();
  const [selected, setSelected] = useState<BreathingProtocol>(BREATHING_PROTOCOLS[0]);
  const [cycles, setCycles] = useState(BREATHING_PROTOCOLS[0].defaultCycles);
  const [inhaleSec, setInhaleSec] = useState(BREATHING_PROTOCOLS[0].inhaleSec);
  const [holdInSec, setHoldInSec] = useState(BREATHING_PROTOCOLS[0].holdInSec);
  const [exhaleSec, setExhaleSec] = useState(BREATHING_PROTOCOLS[0].exhaleSec);
  const [holdOutSec, setHoldOutSec] = useState(BREATHING_PROTOCOLS[0].holdOutSec);

  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(BREATHING_PROTOCOLS[0].inhaleSec);
  const [soundCues, setSoundCues] = useState(true);
  const [loggedMsg, setLoggedMsg] = useState('');

  const selectProtocol = (p: BreathingProtocol) => {
    setRunning(false);
    setCompleted(false);
    setSelected(p);
    setCycles(p.defaultCycles);
    setInhaleSec(p.inhaleSec);
    setHoldInSec(p.holdInSec);
    setExhaleSec(p.exhaleSec);
    setHoldOutSec(p.holdOutSec);
    setCurrentCycle(1);
    setPhase('Inhale');
    setPhaseSecondsLeft(p.inhaleSec);
    setLoggedMsg('');
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        const allPhases: { name: BreathPhase; sec: number }[] = [
          { name: 'Inhale', sec: inhaleSec },
          { name: 'Hold In', sec: holdInSec },
          { name: 'Exhale', sec: exhaleSec },
          { name: 'Hold Out', sec: holdOutSec },
        ];
        const sequence = allPhases.filter((s) => s.sec > 0);

        const idx = sequence.findIndex((s) => s.name === phase);
        const nextIdx = idx + 1;
        if (nextIdx < sequence.length) {
          const next = sequence[nextIdx];
          if (soundCues) ambientAudio.playChime(next.name === 'Exhale' ? 396 : 480, 1.2);
          setPhase(next.name);
          return next.sec;
        }

        // Completed one full breath cycle
        if (currentCycle < cycles) {
          if (soundCues) ambientAudio.playChime(528, 1.4);
          setCurrentCycle((c) => c + 1);
          setPhase(sequence[0].name);
          return sequence[0].sec;
        }

        // All cycles complete
        if (soundCues) ambientAudio.playChime(432, 3.0);
        setRunning(false);
        setCompleted(true);
        const totalMins = Math.max(
          1,
          Math.round(((inhaleSec + holdInSec + exhaleSec + holdOutSec) * cycles) / 60)
        );
        if (user) {
          logPractice({
            type: 'breathing',
            itemId: selected.id,
            title: selected.name,
            category: 'Breathwork',
            durationMinutes: totalMins,
            dateKey: getTodayKey(),
            notes: `${cycles} cycles (${inhaleSec}-${holdInSec}-${exhaleSec}-${holdOutSec})`,
          }).then(() => setLoggedMsg('Breathing session logged to your history.'));
        }
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, phase, currentCycle, cycles, inhaleSec, holdInSec, exhaleSec, holdOutSec, soundCues, selected, user, logPractice]);

  const handleReset = () => {
    setRunning(false);
    setCompleted(false);
    setCurrentCycle(1);
    setPhase('Inhale');
    setPhaseSecondsLeft(inhaleSec);
    setLoggedMsg('');
  };

  const circleScale =
    !running && !completed
      ? 0.78
      : phase === 'Inhale' || phase === 'Hold In'
      ? 1.08
      : 0.72;

  const totalCycleSeconds = inhaleSec + holdInSec + exhaleSec + holdOutSec;
  const estMinutes = Math.max(1, Math.round((totalCycleSeconds * cycles) / 60));

  return (
    <div className="space-y-8">
      {/* Protocol Selector */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BREATHING_PROTOCOLS.map((p) => {
          const active = p.id === selected.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProtocol(p)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? 'border-[#2F5D46] bg-[#F4F8F5] dark:border-[#84B89B] dark:bg-[#1A2921]'
                  : 'border-[#E2E6DF] bg-white hover:border-[#2F5D46]/40 dark:border-[#24322B] dark:bg-[#16201B]'
              }`}
            >
              <p className="font-mono text-xs text-[#5B6860] tabular-nums dark:text-[#98A79E]">
                {p.inhaleSec}-{p.holdInSec}-{p.exhaleSec}-{p.holdOutSec}
              </p>
              <p className="mt-1 text-sm font-semibold">{p.name}</p>
              <p className="mt-1.5 text-xs text-[#526058] dark:text-[#A9B6AE]">
                {p.subtitle}
              </p>
            </button>
          );
        })}
      </section>

      {/* Interactive Breathing Circle & Controls */}
      <section className="grid gap-6 rounded-2xl border border-[#E2E6DF] bg-white p-6 lg:grid-cols-12 lg:p-8 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E2E6DF] bg-[#F8F7F4] py-12 lg:col-span-6 dark:border-[#2C3A33] dark:bg-[#111915]">
          <div className="relative flex h-64 w-64 items-center justify-center">
            <div
              className="absolute h-52 w-52 rounded-full bg-[#2F5D46]/15 transition-transform duration-1000 ease-out dark:bg-[#69A785]/20"
              style={{ transform: `scale(${circleScale})` }}
            />
            <div
              className="relative flex h-40 w-40 flex-col items-center justify-center rounded-full border border-[#2F5D46]/35 bg-white shadow-sm transition-transform duration-1000 ease-out dark:border-[#84B89B]/40 dark:bg-[#19241E]"
              style={{ transform: `scale(${circleScale})` }}
            >
              <span className="text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                {completed ? 'Complete' : phase}
              </span>
              <span className="mt-1 font-mono text-3xl font-semibold tabular-nums">
                {completed ? 'Done' : `${phaseSecondsLeft}s`}
              </span>
              <span className="mt-1 font-mono text-[11px] text-[#5B6860] tabular-nums dark:text-[#98A79E]">
                Cycle {currentCycle} / {cycles}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (completed) handleReset();
                setRunning((r) => !r);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2F5D46] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#264C39]"
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{running ? 'Pause' : completed ? 'Practice Again' : 'Start Practice'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset breathing session"
              className="rounded-lg border border-[#D7DDD6] bg-white p-2.5 hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {loggedMsg && (
            <p className="mt-4 text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
              {loggedMsg}
            </p>
          )}
        </div>

        <div className="space-y-6 lg:col-span-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">{selected.name}</h2>
            <p className="mt-1 text-sm text-[#526058] dark:text-[#A9B6AE]">
              Estimated session duration: <span className="font-mono tabular-nums">{estMinutes} min</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              Inhale (sec)
              <input
                type="number"
                min={2}
                max={10}
                value={inhaleSec}
                disabled={running}
                onChange={(e) => setInhaleSec(Math.max(2, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              />
            </label>
            <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              Hold In (sec)
              <input
                type="number"
                min={0}
                max={10}
                value={holdInSec}
                disabled={running}
                onChange={(e) => setHoldInSec(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              />
            </label>
            <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              Exhale (sec)
              <input
                type="number"
                min={2}
                max={12}
                value={exhaleSec}
                disabled={running}
                onChange={(e) => setExhaleSec(Math.max(2, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              />
            </label>
            <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              Hold Out (sec)
              <input
                type="number"
                min={0}
                max={10}
                value={holdOutSec}
                disabled={running}
                onChange={(e) => setHoldOutSec(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              />
            </label>
            <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              Cycles
              <input
                type="number"
                min={1}
                max={20}
                value={cycles}
                disabled={running}
                onChange={(e) => setCycles(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              />
            </label>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={soundCues}
                  onChange={(e) => setSoundCues(e.target.checked)}
                  className="accent-[#2F5D46]"
                />
                <span>Chime cues</span>
              </label>
            </div>
          </div>

          <div className="border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
            <h3 className="text-sm font-semibold">Benefits</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#526058] dark:text-[#A9B6AE]">
              {selected.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-4 text-xs text-[#4A5750] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#B4C2BA]">
            <strong className="font-semibold text-[#18221D] dark:text-[#EEF2EE]">
              Safety Guidance:
            </strong>{' '}
            {selected.safetyNote}
          </div>
        </div>
      </section>
    </div>
  );
};
