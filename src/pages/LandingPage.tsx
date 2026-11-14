import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Moon, Sun } from 'lucide-react';
import {
  IMAGES,
  YOGA_POSES,
  MEDITATION_SESSIONS,
  LANDING_TESTIMONIALS,
  LANDING_FAQS,
} from '../data/wellnessData';
import { useAuth } from '../context/AuthContext';
import { useCoachDrawer } from '../context/CoachDrawerContext';
import { ResilientImage } from '../components/ResilientImage';
import { PWAInstallButton, OfflineIndicator } from '../components/PWAControls';

export const LandingPage: React.FC = () => {
  const { user, theme, toggleTheme, signIn } = useAuth();
  const { openCoach } = useCoachDrawer();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [signingIn, setSigningIn] = useState(false);

  const handleStartJourney = async () => {
    if (user) {
      navigate('/dashboard');
      return;
    }
    setSigningIn(true);
    try {
      await signIn();
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#18221D] dark:bg-[#0F1612] dark:text-[#EEF2EE]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-[#E2E6DF] bg-[#F8F7F4]/95 backdrop-blur-sm dark:border-[#24322B] dark:bg-[#0F1612]/95">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-6">
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-tight text-[#18221D] whitespace-nowrap shrink-0 dark:text-[#EEF2EE]"
          >
            FlowState Wellness
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#4A5750] md:flex dark:text-[#B4C2BA]">
            <Link
              to="/yoga"
              className="hover:text-[#18221D] hover:underline underline-offset-4 whitespace-nowrap shrink-0 dark:hover:text-[#EEF2EE]"
            >
              Yoga
            </Link>
            <Link
              to="/meditation"
              className="hover:text-[#18221D] hover:underline underline-offset-4 whitespace-nowrap shrink-0 dark:hover:text-[#EEF2EE]"
            >
              Meditation
            </Link>
            <Link
              to="/assistant"
              className="hover:text-[#18221D] hover:underline underline-offset-4 whitespace-nowrap shrink-0 dark:hover:text-[#EEF2EE]"
            >
              AI Coach
            </Link>
            <Link
              to="/knowledge"
              className="hover:text-[#18221D] hover:underline underline-offset-4 whitespace-nowrap shrink-0 dark:hover:text-[#EEF2EE]"
            >
              Knowledge
            </Link>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleStartJourney}
              disabled={signingIn}
              className="rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#264C39] whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {user ? 'Open Sanctuary' : signingIn ? 'Connecting...' : 'Start Journey'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16 pt-12 lg:pt-16">
        <div className="grid items-stretch gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-medium tracking-wide text-[#2F5D46] dark:text-[#84B89B]">
              Yoga · Meditation · Breathwork · Gemini Coaching
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.25rem,4vw,3.65rem)] font-semibold leading-[1.08] tracking-tight text-[#18221D] dark:text-[#EEF2EE]">
              Find Your Balance. Transform Your Life.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4A5750] dark:text-[#B4C2BA]">
              FlowState Wellness brings together structured yoga asana libraries, real-time ambient meditation, guided pranayama breathwork, and a context-aware Gemini AI companion tailored to your daily rhythm.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleStartJourney}
                disabled={signingIn}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2F5D46] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#264C39] whitespace-nowrap shrink-0"
              >
                <span>Start Your Wellness Journey</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/yoga"
                className="inline-flex items-center gap-2 rounded-lg border border-[#CFD6CE] bg-white px-6 py-3 text-sm font-medium text-[#18221D] transition hover:bg-[#EFECE6] whitespace-nowrap shrink-0 dark:border-[#2C3A33] dark:bg-[#16201B] dark:text-[#EEF2EE] dark:hover:bg-[#1E2A23]"
              >
                Explore Yoga
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-[#E2E6DF] pt-6 text-xs text-[#5B6860] dark:border-[#24322B] dark:text-[#98A79E]">
              <span>14 Guided Yoga Asanas</span>
              <span aria-hidden="true">·</span>
              <span>Web Audio Soundscapes</span>
              <span aria-hidden="true">·</span>
              <span>English, Hindi &amp; Marathi AI Coach</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[340px] overflow-hidden rounded-2xl border border-[#E2E6DF] bg-[#EFECE6] dark:border-[#24322B] dark:bg-[#16201B]">
              <ResilientImage
                src={IMAGES.hero}
                alt="Sunlit FlowState yoga and meditation sanctuary"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Yoga Programs */}
      <section className="border-t border-[#E2E6DF] bg-[#F4F1EA]/70 py-16 dark:border-[#24322B] dark:bg-[#131C17]">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#18221D] sm:text-3xl dark:text-[#EEF2EE]">
                Featured Yoga Programs
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[#526058] dark:text-[#A9B6AE]">
                Postures organized across ten practice goals with step-by-step alignment, breath cues, beginner modifications, and guided flow timers.
              </p>
            </div>
            <Link
              to="/yoga"
              className="text-sm font-medium text-[#2F5D46] hover:underline underline-offset-4 whitespace-nowrap dark:text-[#84B89B]"
            >
              Browse full asana library
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {YOGA_POSES.slice(0, 3).map((pose) => (
              <Link
                key={pose.id}
                to={`/yoga?pose=${pose.id}`}
                className="group overflow-hidden rounded-xl border border-[#E2E6DF] bg-white transition hover:border-[#2F5D46]/50 dark:border-[#24322B] dark:bg-[#16201B] dark:hover:border-[#84B89B]/40"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#EFECE6] dark:bg-[#1B2720]">
                  <ResilientImage
                    src={pose.image}
                    alt={`${pose.englishName} (${pose.sanskritName})`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                    <span>{pose.sanskritName}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>{pose.difficulty}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="tabular-nums">{pose.durationMinutes} min</span>
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                    {pose.englishName}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
                    {pose.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Meditation & Breathwork + AI Wellness Assistant */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-2xl border border-[#E2E6DF] bg-white p-8 lg:col-span-7 dark:border-[#24322B] dark:bg-[#16201B]">
            <div>
              <p className="text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                Meditation &amp; Breathwork Studio
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                Stillness Supported by Indian Ragas &amp; Ambient Audio
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#526058] dark:text-[#A9B6AE]">
                Pair guided mindfulness, sleep yoga nidra, and body scans with synthesized Tanpura Sa-Pa drones, Raga Yaman Bansuri flute, Santoor Bhopali plucks, singing bowls, or 136.1 Hz Om harmonics—plus an animated breathing circle.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {MEDITATION_SESSIONS.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    className="border-t border-[#E2E6DF] pt-3 dark:border-[#24322B]"
                  >
                    <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                      {session.category} · <span className="tabular-nums">{session.durationMinutes} min</span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                      {session.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/meditation"
                className="rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39] whitespace-nowrap"
              >
                Open Meditation Studio
              </Link>
              <Link
                to="/breathing"
                className="rounded-lg border border-[#CFD6CE] px-4 py-2 text-xs font-medium text-[#18221D] hover:bg-[#EFECE6] whitespace-nowrap dark:border-[#2C3A33] dark:text-[#EEF2EE] dark:hover:bg-[#1E2A23]"
              >
                Try Breathing Circle
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[#E2E6DF] bg-[#EFECE6] p-8 lg:col-span-5 dark:border-[#24322B] dark:bg-[#19241E]">
            <div>
              <p className="text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                Gemini AI Coaching
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                Your Context-Aware Wellness &amp; Yoga Companion
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4A5750] dark:text-[#B4C2BA]">
                Ask for a 15-minute morning back-care routine, step-by-step Tadasana modifications, or sleep wind-down ideas in English, Hindi, or Marathi—with voice input and spoken playback.
              </p>
              <div className="mt-6 space-y-2 border-t border-[#D9DDD5] pt-4 text-xs text-[#4A5750] dark:border-[#2C3A33] dark:text-[#B4C2BA]">
                <p>“Suggest a 20-minute morning yoga sequence for stiff hips.”</p>
                <p>“How should I breathe during Warrior II?”</p>
                <p>“Explain 4-7-8 breathing precautions.”</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  openCoach({
                    mode: 'yoga-coach',
                    activeContext: 'Landing Showcase',
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#18221D] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#26352E] dark:bg-[#2F5D46] dark:hover:bg-[#264C39] whitespace-nowrap"
              >
                <span>Chat with AI Coach</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <Link
                to="/assistant"
                className="inline-flex items-center gap-2 rounded-lg border border-[#CFD6CE] bg-white px-4 py-2.5 text-xs font-medium text-[#18221D] hover:bg-[#F8F7F4] dark:border-[#2C3A33] dark:bg-[#131C17] dark:text-[#EEF2EE] whitespace-nowrap"
              >
                Full AI Workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Recommendations & Benefits */}
      <section className="border-t border-[#E2E6DF] bg-white py-16 dark:border-[#24322B] dark:bg-[#131C17]">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="font-display text-2xl font-semibold text-[#18221D] sm:text-3xl dark:text-[#EEF2EE]">
            Daily Rhythm &amp; Holistic Benefits
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="border-t border-[#E2E6DF] pt-5 dark:border-[#24322B]">
              <p className="font-mono text-xs text-[#5B6860] dark:text-[#98A79E]">01 · Morning Anchor</p>
              <h3 className="mt-2 text-lg font-semibold">Spinal Mobility &amp; Focus</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#526058] dark:text-[#A9B6AE]">
                Begin with 6 minutes of Cat-Cow and Mountain Pose to awaken posture, steady nasal breath, and hydrate before screens.
              </p>
            </div>
            <div className="border-t border-[#E2E6DF] pt-5 dark:border-[#24322B]">
              <p className="font-mono text-xs text-[#5B6860] dark:text-[#98A79E]">02 · Midday Reset</p>
              <h3 className="mt-2 text-lg font-semibold">Autonomic Stress Regulation</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#526058] dark:text-[#A9B6AE]">
                Five minutes of Box Breathing or Resonant Breathing interrupts desk tension and restores clear, measured attention.
              </p>
            </div>
            <div className="border-t border-[#E2E6DF] pt-5 dark:border-[#24322B]">
              <p className="font-mono text-xs text-[#5B6860] dark:text-[#98A79E]">03 · Evening Release</p>
              <h3 className="mt-2 text-lg font-semibold">Restorative Sleep Readiness</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#526058] dark:text-[#A9B6AE]">
                Pair Child’s Pose, Savasana, and a Body Scan meditation with soft rain audio to close out the day smoothly.
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-14 border-t border-[#E2E6DF] pt-12 dark:border-[#24322B]">
            <h3 className="font-display text-xl font-semibold text-[#18221D] dark:text-[#EEF2EE]">
              Practitioner Stories
            </h3>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {LANDING_TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl border border-[#E2E6DF] bg-[#F8F7F4] p-6 dark:border-[#24322B] dark:bg-[#16201B]"
                >
                  <p className="text-sm leading-relaxed text-[#35423B] dark:text-[#C8D3CC]">
                    “{t.quote}”
                  </p>
                  <div className="mt-4 border-t border-[#E2E6DF] pt-3 dark:border-[#24322B]">
                    <p className="text-sm font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                      {t.role} · {t.organization}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-[900px] px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-[#18221D] sm:text-3xl dark:text-[#EEF2EE]">
          Frequently Asked Questions
        </h2>
        <div className="mt-6 divide-y divide-[#E2E6DF] border-y border-[#E2E6DF] dark:divide-[#24322B] dark:border-[#24322B]">
          {LANDING_FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-[#18221D] sm:text-base dark:text-[#EEF2EE]"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm leading-relaxed text-[#526058] dark:text-[#A9B6AE]">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E2E6DF] bg-[#F4F1EA] py-10 dark:border-[#24322B] dark:bg-[#131C17]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-semibold text-[#18221D] dark:text-[#EEF2EE]">
              FlowState Wellness
            </p>
            <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
              Educational yoga, meditation, and holistic habit platform. Not a medical service.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#4A5750] dark:text-[#B4C2BA]">
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/deep-dive" className="hover:underline">Deep Dive</Link>
            <Link to="/challenges" className="hover:underline">Challenges</Link>
            <Link to="/chat" className="hover:underline">Google Chat</Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7DDD6] bg-white px-3 py-1.5 font-medium text-[#18221D] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE]"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <PWAInstallButton compact />
          </div>
        </div>
      </footer>

      <OfflineIndicator />
    </div>
  );
};
