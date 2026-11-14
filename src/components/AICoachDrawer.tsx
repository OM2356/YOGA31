import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Copy,
  Maximize2,
  Mic,
  MicOff,
  Plus,
  RefreshCw,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AiChatMessage, useAuth } from '../context/AuthContext';
import { computeStreak } from '../utils/metrics';
import { sendGeminiChatStream } from '../utils/aiChatClient';
import { FormattedMessage } from './FormattedMessage';

export interface AICoachDrawerProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'assistant' | 'yoga-coach';
  initialPrompt?: string;
  activeContext?: string;
  autoSend?: boolean;
}

const DRAWER_PROMPTS: Record<'assistant' | 'yoga-coach', string[]> = {
  assistant: [
    'Build a 15-minute evening sleep wind-down routine.',
    'Which breathwork calms pre-meeting tension fastest?',
    'Explain how Ayurveda views morning vs evening energy.',
  ],
  'yoga-coach': [
    'Give me a 15-minute morning sequence for stiff hips.',
    'Explain Tadasana alignment and breathing step by step.',
    'What beginner modifications help with tight hamstrings?',
  ],
};

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({
  open,
  onClose,
  initialMode = 'yoga-coach',
  initialPrompt = '',
  activeContext = '',
  autoSend = false,
}) => {
  const navigate = useNavigate();
  const { user, profile, moodEntries, practiceLogs, saveConversation } = useAuth();

  const [mode, setMode] = useState<'assistant' | 'yoga-coach'>(initialMode);
  const [speed, setSpeed] = useState<'balanced' | 'fast'>('balanced');
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Marathi'>('English');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const lastAutoPromptRef = useRef<string>('');

  const streak = useMemo(() => computeStreak(practiceLogs), [practiceLogs]);

  useEffect(() => {
    if (!open) {
      lastAutoPromptRef.current = '';
      return;
    }
    setMode(initialMode);
    if (initialPrompt && initialPrompt !== lastAutoPromptRef.current) {
      lastAutoPromptRef.current = initialPrompt;
      if (autoSend) {
        void sendMessage(initialPrompt);
      } else {
        setInput(initialPrompt);
      }
    }
  }, [open, initialMode, initialPrompt, autoSend]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, loading]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop?.();
    };
  }, []);

  if (!open) return null;

  const sendMessage = async (textOverride?: string, isRetry = false) => {
    const queryText = (textOverride ?? input).trim();
    if (!queryText || loading) return;

    setErrorMsg('');
    setLoading(true);
    setStreamingText('');
    setFollowUps([]);

    const baseHistory = isRetry ? messages.slice(0, -1) : messages;
    const userMsg: AiChatMessage = {
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = isRetry ? [...messages] : [...baseHistory, userMsg];
    if (!isRetry) {
      setMessages(nextMessages);
      setInput('');
    }

    try {
      const result = await sendGeminiChatStream({
        message: queryText,
        mode,
        language,
        speed,
        history: baseHistory.map((m) => ({ role: m.role, text: m.text })),
        userContext: {
          displayName: profile?.displayName || user?.displayName,
          experienceLevel: profile?.experienceLevel,
          primaryGoals: profile?.primaryGoals,
          preferredStyles: profile?.preferredStyles,
          availableMinutes: profile?.availableMinutes,
          preferredPracticeTime: profile?.preferredPracticeTime,
          recentMood: moodEntries[0]?.mood,
          currentStreak: streak.current,
          recentSessions: practiceLogs.slice(0, 3).map((l) => `${l.title} (${l.durationMinutes}m)`),
          activeContext,
        },
        onChunk: (partial) => setStreamingText(partial),
      });

      const aiMsg: AiChatMessage = {
        role: 'model',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updated = [...nextMessages, aiMsg];
      setMessages(updated);
      setStreamingText('');
      setFollowUps(result.suggestedFollowUps);

      if (user) {
        const title = (updated[0]?.text || 'Coach Session').slice(0, 72);
        const savedId = await saveConversation(
          { mode, language, title, messages: updated },
          activeConvId
        );
        if (savedId && !activeConvId) setActiveConvId(savedId);
      }
    } catch (err: any) {
      setStreamingText('');
      setErrorMsg(
        err?.message ||
          'Unable to reach Gemini AI right now. Verify GEMINI_API_KEY in Settings > Secrets and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) sendMessage(lastUser.text, true);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    window.setTimeout(() => setCopiedIdx(null), 1800);
  };

  const handleSpeak = (text: string, idx: number) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === 'Hindi' ? 'hi-IN' : language === 'Marathi' ? 'mr-IN' : 'en-US';
    utter.onend = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utter);
  };

  const toggleVoiceInput = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMsg('Speech recognition is not supported in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRec();
    rec.lang = language === 'Hindi' ? 'hi-IN' : language === 'Marathi' ? 'mr-IN' : 'en-US';
    rec.interimResults = false;
    rec.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const handleOpenFullView = () => {
    onClose();
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (activeConvId) params.set('conv', activeConvId);
    navigate(`/assistant?${params.toString()}`);
  };

  const startFresh = () => {
    setActiveConvId(undefined);
    setMessages([]);
    setStreamingText('');
    setFollowUps([]);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="AI Coach and Chat">
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-[#E2E6DF] bg-white shadow-xl dark:border-[#24322B] dark:bg-[#131C17]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E2E6DF] px-5 py-4 dark:border-[#24322B]">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-semibold text-[#18221D] dark:text-[#EEF2EE]">
              {mode === 'yoga-coach' ? 'AI Yoga Coach' : 'AI Wellness Chat'}
            </h2>
            <p className="truncate text-xs text-[#5B6860] dark:text-[#98A79E]">
              {activeContext
                ? activeContext
                : `${profile?.experienceLevel || 'Personalized'} guidance · ${language}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={startFresh}
              title="New conversation"
              aria-label="New conversation"
              className="rounded-lg border border-[#D7DDD6] p-2 text-[#4A5750] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#B4C2BA] dark:hover:bg-[#223029]"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenFullView}
              title="Open full AI workspace"
              aria-label="Open full AI workspace"
              className="rounded-lg border border-[#D7DDD6] p-2 text-[#4A5750] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#B4C2BA] dark:hover:bg-[#223029]"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI Coach drawer"
              className="rounded-lg p-2 text-[#5B6860] hover:bg-[#EFECE6] dark:text-[#98A79E] dark:hover:bg-[#223029]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Role + Speed + Language Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E6DF] bg-[#F8F7F4] px-5 py-2.5 dark:border-[#24322B] dark:bg-[#0F1612]">
          <div className="flex items-center gap-1 rounded-lg bg-[#EFECE6] p-0.5 dark:bg-[#19241E]">
            <button
              type="button"
              onClick={() => setMode('yoga-coach')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition whitespace-nowrap ${
                mode === 'yoga-coach'
                  ? 'bg-white text-[#18221D] shadow-sm dark:bg-[#26352E] dark:text-[#EEF2EE]'
                  : 'text-[#526058] dark:text-[#A3B0A8]'
              }`}
            >
              Yoga Coach
            </button>
            <button
              type="button"
              onClick={() => setMode('assistant')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition whitespace-nowrap ${
                mode === 'assistant'
                  ? 'bg-white text-[#18221D] shadow-sm dark:bg-[#26352E] dark:text-[#EEF2EE]'
                  : 'text-[#526058] dark:text-[#A3B0A8]'
              }`}
            >
              Wellness Chat
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Response speed"
              value={speed}
              onChange={(e) => setSpeed(e.target.value as 'balanced' | 'fast')}
              className="rounded-lg border border-[#D7DDD6] bg-white px-2 py-1 text-xs text-[#18221D] dark:border-[#2C3A33] dark:bg-[#16201B] dark:text-[#EEF2EE]"
            >
              <option value="balanced">Balanced (Hydrogen)</option>
              <option value="fast">Fast (Flash Lite)</option>
            </select>
            <select
              aria-label="Chat language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'English' | 'Hindi' | 'Marathi')}
              className="rounded-lg border border-[#D7DDD6] bg-white px-2 py-1 text-xs text-[#18221D] dark:border-[#2C3A33] dark:bg-[#16201B] dark:text-[#EEF2EE]"
            >
              <option value="English">EN</option>
              <option value="Hindi">HI</option>
              <option value="Marathi">MR</option>
            </select>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && !loading ? (
            <div className="py-4">
              <p className="text-sm font-medium text-[#18221D] dark:text-[#EEF2EE]">
                {mode === 'yoga-coach'
                  ? 'Ask your Yoga Coach for alignment, sequences, or modifications.'
                  : 'Ask your Wellness Assistant about sleep, breathwork, stress, or habits.'}
              </p>
              <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
                Multi-turn context is preserved across your thread{user ? ' and synced to your account.' : '.'}
              </p>
              <div className="mt-4 space-y-2">
                {DRAWER_PROMPTS[mode].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => sendMessage(p)}
                    className="block w-full rounded-xl border border-[#E2E6DF] bg-[#F8F7F4] p-3 text-left text-xs text-[#35423B] transition hover:border-[#2F5D46]/50 dark:border-[#2C3A33] dark:bg-[#16201B] dark:text-[#C8D3CC]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-[#2F5D46] text-white'
                      : 'border border-[#E2E6DF] bg-[#F8F7F4] text-[#18221D] dark:border-[#2C3A33] dark:bg-[#16201B] dark:text-[#EEF2EE]'
                  }`}
                >
                  <FormattedMessage text={m.text} isUser={m.role === 'user'} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-[#78857D]">
                  <span className="tabular-nums">{m.timestamp}</span>
                  {m.role === 'model' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopy(m.text, idx)}
                        className="inline-flex items-center gap-1 hover:text-[#18221D] dark:hover:text-[#EEF2EE]"
                      >
                        {copiedIdx === idx ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSpeak(m.text, idx)}
                        className="inline-flex items-center gap-1 hover:text-[#18221D] dark:hover:text-[#EEF2EE]"
                      >
                        {speakingIdx === idx ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        <span>{speakingIdx === idx ? 'Stop' : 'Listen'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="max-w-[88%] rounded-2xl border border-[#E2E6DF] bg-[#F8F7F4] px-4 py-3 text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#16201B] dark:text-[#EEF2EE]">
                {streamingText ? (
                  <FormattedMessage text={streamingText} />
                ) : (
                  <span className="text-xs text-[#5B6860] dark:text-[#A9B6AE]">
                    Composing personalized guidance...
                  </span>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              <p>{errorMsg}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold underline"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry last question</span>
              </button>
            </div>
          )}

          {followUps.length > 0 && !loading && (
            <div className="flex flex-wrap gap-2 pt-1">
              {followUps.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => sendMessage(f)}
                  className="rounded-lg border border-[#D7DDD6] bg-white px-2.5 py-1.5 text-xs text-[#2F5D46] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#84B89B]"
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 border-t border-[#E2E6DF] p-4 dark:border-[#24322B]"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
            className={`rounded-lg border p-2.5 transition ${
              listening
                ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40'
                : 'border-[#D7DDD6] text-[#4A5750] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#B4C2BA]'
            }`}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'yoga-coach'
                ? 'Ask your Yoga Coach...'
                : 'Ask your Wellness Assistant...'
            }
            className="flex-1 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3.5 py-2.5 text-sm text-[#18221D] placeholder:text-[#78857D] focus:border-[#2F5D46] focus:outline-none dark:border-[#2C3A33] dark:bg-[#0F1612] dark:text-[#EEF2EE]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5D46] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#264C39] disabled:opacity-50 whitespace-nowrap"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </aside>
    </div>
  );
};
