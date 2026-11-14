import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check,
  Copy,
  Mic,
  MicOff,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AiChatMessage, AiConversation, useAuth } from '../context/AuthContext';
import { computeStreak } from '../utils/metrics';
import { sendGeminiChatStream } from '../utils/aiChatClient';
import { FormattedMessage } from '../components/FormattedMessage';

const ASSISTANT_PROMPTS = [
  'Create a calm 15-minute evening wind-down routine for better sleep.',
  'Suggest breathing exercises I can do before a high-stakes meeting.',
  'Explain Ayurvedic Dinacharya habits grounded in practical science.',
  'Recommend Knowledge Hub topics for stress management.',
];

const COACH_PROMPTS = [
  'Which yoga poses are safest for a complete beginner?',
  'Give me a 20-minute morning yoga sequence for flexibility.',
  'Explain how to perform Tadasana step by step with breathing.',
  'Suggest gentle yoga for lower back stiffness after desk work.',
];

export const AIAssistantPage: React.FC<{
  defaultMode?: 'assistant' | 'yoga-coach';
}> = ({ defaultMode }) => {
  const [searchParams] = useSearchParams();
  const {
    user,
    profile,
    moodEntries,
    practiceLogs,
    conversations,
    saveConversation,
    deleteConversation,
  } = useAuth();

  const paramMode = searchParams.get('mode');
  const initialMode: 'assistant' | 'yoga-coach' =
    paramMode === 'yoga-coach'
      ? 'yoga-coach'
      : paramMode === 'assistant'
        ? 'assistant'
        : defaultMode || 'assistant';

  const [mode, setMode] = useState<'assistant' | 'yoga-coach'>(initialMode);
  const [speed, setSpeed] = useState<'balanced' | 'fast'>('balanced');
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Marathi'>('English');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const streak = useMemo(() => computeStreak(practiceLogs), [practiceLogs]);

  // Load conversation when ?conv=<id> is provided
  useEffect(() => {
    const convParam = searchParams.get('conv');
    if (convParam && conversations.length > 0 && activeConvId !== convParam) {
      const found = conversations.find((c) => c.id === convParam);
      if (found) {
        setActiveConvId(found.id);
        setMode(found.mode);
        setLanguage(found.language);
        setMessages(found.messages);
      }
    }
  }, [searchParams, conversations, activeConvId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, loading]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop?.();
    };
  }, []);

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
          recentSessions: practiceLogs
            .slice(0, 3)
            .map((l) => `${l.title} (${l.durationMinutes}m)`),
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
        const title = (updated[0]?.text || 'Wellness Session').slice(0, 72);
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
    if (lastUser) {
      sendMessage(lastUser.text, true);
    }
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

  const loadConversation = (conv: AiConversation) => {
    setActiveConvId(conv.id);
    setMode(conv.mode);
    setLanguage(conv.language);
    setMessages(conv.messages);
    setStreamingText('');
    setErrorMsg('');
    setFollowUps([]);
  };

  const startNewChat = () => {
    setActiveConvId(undefined);
    setMessages([]);
    setStreamingText('');
    setFollowUps([]);
    setErrorMsg('');
  };

  const prompts = mode === 'yoga-coach' ? COACH_PROMPTS : ASSISTANT_PROMPTS;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Saved History Sidebar */}
      <aside className="rounded-xl border border-[#E2E6DF] bg-white p-4 lg:col-span-3 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Saved Sessions</h2>
          <button
            type="button"
            onClick={startNewChat}
            className="inline-flex items-center gap-1 rounded-lg bg-[#2F5D46] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#264C39] whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="mt-4 space-y-1.5">
          {!user ? (
            <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
              Sign in to sync AI conversations across devices.
            </p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
              Your saved AI chats will appear here.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center justify-between gap-2 rounded-lg p-2 text-xs transition ${
                  activeConvId === conv.id
                    ? 'bg-[#EFECE6] font-medium dark:bg-[#223029]'
                    : 'hover:bg-[#F8F7F4] dark:hover:bg-[#1B2720]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => loadConversation(conv)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-[#18221D] dark:text-[#EEF2EE]">{conv.title}</p>
                  <p className="text-[11px] text-[#5B6860] dark:text-[#98A79E]">
                    {conv.mode === 'yoga-coach' ? 'Yoga Coach' : 'Assistant'} · {conv.language}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConversation(conv.id);
                    if (activeConvId === conv.id) startNewChat();
                  }}
                  aria-label="Delete conversation"
                  className="rounded p-1 text-[#78857D] hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Chat Viewport */}
      <section className="flex h-[74vh] min-h-[540px] flex-col rounded-xl border border-[#E2E6DF] bg-white lg:col-span-9 dark:border-[#24322B] dark:bg-[#16201B]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E6DF] px-5 py-3.5 dark:border-[#24322B]">
          <div className="flex items-center gap-1 rounded-lg bg-[#EFECE6] p-1 dark:bg-[#111915]">
            <button
              type="button"
              onClick={() => setMode('assistant')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                mode === 'assistant'
                  ? 'bg-white text-[#18221D] shadow-sm dark:bg-[#26352E] dark:text-[#EEF2EE]'
                  : 'text-[#526058] dark:text-[#A3B0A8]'
              }`}
            >
              Wellness Assistant
            </button>
            <button
              type="button"
              onClick={() => setMode('yoga-coach')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                mode === 'yoga-coach'
                  ? 'bg-white text-[#18221D] shadow-sm dark:bg-[#26352E] dark:text-[#EEF2EE]'
                  : 'text-[#526058] dark:text-[#A3B0A8]'
              }`}
            >
              AI Yoga Coach
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-[#5B6860] dark:text-[#98A79E]">
              Model:
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value as 'balanced' | 'fast')}
                className="ml-1.5 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-2.5 py-1 text-xs text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              >
                <option value="balanced">Gemini 4 Hydrogen</option>
                <option value="fast">Gemini 3.1 Flash Lite (Fast)</option>
              </select>
            </label>
            <label className="text-xs text-[#5B6860] dark:text-[#98A79E]">
              Language:
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'English' | 'Hindi' | 'Marathi')}
                className="ml-1.5 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-2.5 py-1 text-xs text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Marathi">Marathi (मराठी)</option>
              </select>
            </label>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={startNewChat}
                className="rounded-lg border border-[#D7DDD6] px-2.5 py-1 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:hover:bg-[#223029]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && !loading ? (
            <div className="mx-auto max-w-xl py-8 text-center">
              <h3 className="font-display text-xl font-semibold">
                {mode === 'yoga-coach'
                  ? 'FlowState AI Yoga Coach'
                  : 'FlowState AI Wellness Assistant'}
              </h3>
              <p className="mt-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
                {mode === 'yoga-coach'
                  ? 'Ask for posture alignment, custom routines, breath coordination, or beginner modifications.'
                  : 'Ask about meditation, breathwork, daily routines, sleep habits, or holistic nutrition. Educational guidance only—never a medical diagnosis.'}
              </p>
              {profile && (
                <p className="mt-2 text-xs text-[#5B6860] dark:text-[#98A79E]">
                  Personalized for {profile.experienceLevel} · {profile.availableMinutes} min/day ·{' '}
                  {streak.current} day streak
                </p>
              )}
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {prompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => sendMessage(p)}
                    className="rounded-xl border border-[#E2E6DF] bg-[#F8F7F4] p-3 text-left text-xs text-[#35423B] transition hover:border-[#2F5D46]/50 dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#C8D3CC]"
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
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-[#2F5D46] text-white'
                      : 'border border-[#E2E6DF] bg-[#F8F7F4] text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]'
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
                        {copiedIdx === idx ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSpeak(m.text, idx)}
                        className="inline-flex items-center gap-1 hover:text-[#18221D] dark:hover:text-[#EEF2EE]"
                      >
                        {speakingIdx === idx ? (
                          <VolumeX className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                        <span>{speakingIdx === idx ? 'Stop' : 'Listen'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-start">
              <div className="max-w-[85%] rounded-2xl border border-[#E2E6DF] bg-[#F8F7F4] px-4 py-3 text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]">
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
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
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
            <div className="flex flex-wrap gap-2 pt-2">
              {followUps.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => sendMessage(f)}
                  className="rounded-lg border border-[#D7DDD6] bg-white px-3 py-1.5 text-xs text-[#2F5D46] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#84B89B]"
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
                ? 'Ask about a yoga pose, sequence, or modification...'
                : 'Ask about wellness, meditation, breathwork, or habits...'
            }
            className="flex-1 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#18221D] placeholder:text-[#78857D] focus:border-[#2F5D46] focus:outline-none dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5D46] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#264C39] disabled:opacity-50 whitespace-nowrap"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </section>
    </div>
  );
};
