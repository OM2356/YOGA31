import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Simple sliding-window rate limiter for AI endpoints
const rateLimitStore = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 30;

function aiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const timestamps = (rateLimitStore.get(key) || []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many wellness AI requests. Please pause for a moment and try again.',
    });
  }
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  next();
}

function sanitizeText(value: unknown, maxLen = 2000): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLen);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
    });
  });

  function buildChatConfig(body: any) {
    const mode = body?.mode === 'yoga-coach' ? 'yoga-coach' : 'assistant';
    const language = ['English', 'Hindi', 'Marathi'].includes(body?.language)
      ? body.language
      : 'English';
    const modelChoice =
      body?.speed === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';

    const rawHistory = Array.isArray(body?.history) ? body.history.slice(-16) : [];
    const userContext = body?.userContext || {};

    const recentSessionsList = Array.isArray(userContext.recentSessions)
      ? userContext.recentSessions
          .slice(0, 4)
          .map((s: unknown) => sanitizeText(s, 60))
          .filter(Boolean)
          .join(', ')
      : '';

    const contextSummary = [
      userContext.displayName ? `Name: ${sanitizeText(userContext.displayName, 60)}` : '',
      userContext.experienceLevel ? `Experience level: ${sanitizeText(userContext.experienceLevel, 30)}` : '',
      Array.isArray(userContext.primaryGoals) && userContext.primaryGoals.length
        ? `Goals: ${userContext.primaryGoals.slice(0, 6).map((g: unknown) => sanitizeText(g, 40)).join(', ')}`
        : '',
      Array.isArray(userContext.preferredStyles) && userContext.preferredStyles.length
        ? `Preferred styles: ${userContext.preferredStyles.slice(0, 6).map((s: unknown) => sanitizeText(s, 40)).join(', ')}`
        : '',
      userContext.availableMinutes ? `Available daily time: ${Number(userContext.availableMinutes)} minutes` : '',
      userContext.preferredPracticeTime ? `Preferred time: ${sanitizeText(userContext.preferredPracticeTime, 30)}` : '',
      userContext.recentMood ? `Latest logged mood: ${sanitizeText(userContext.recentMood, 30)}` : '',
      typeof userContext.currentStreak === 'number' ? `Current practice streak: ${userContext.currentStreak} days` : '',
      recentSessionsList ? `Recent sessions: ${recentSessionsList}` : '',
      userContext.activeContext ? `Current view context: ${sanitizeText(userContext.activeContext, 120)}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const systemInstruction =
      mode === 'yoga-coach'
        ? `You are FlowState AI Yoga Coach — a calm, attentive, certified-style yoga alignment and sequencing guide inside FlowState Wellness.
User profile context: ${contextSummary || 'General wellness practitioner'}.
Language requirement: Respond warmly and naturally in ${language}.
Capabilities:
- Recommend safe, tailored yoga asana sequences based on experience level, available time, recent practice, and goals.
- Explain posture alignment step-by-step, breath coordination (inhale/exhale), common mistakes, beginner modifications, and precautions.
- Suggest relevant FlowState Yoga poses when helpful (such as Tadasana, Vrikshasana, Adho Mukha Svanasana, Virabhadrasana II, Bhujangasana, Balasana, Setu Bandhasana, Marjaryasana-Bitilasana, Paschimottanasana, Savasana).
Safety rules:
- Never diagnose medical conditions or guarantee health outcomes.
- Recommend consulting a qualified physician or physical therapist for acute pain, injury, pregnancy, or chronic medical concerns.
- Keep responses structured, clear, practical, and concise (around 150-320 words unless a detailed multi-step routine is requested).`
        : `You are FlowState AI Wellness Assistant — a warm, knowledgeable, holistic wellness guide inside FlowState Wellness.
User profile context: ${contextSummary || 'General wellness practitioner'}.
Language requirement: Respond naturally and empathetically in ${language}.
Capabilities:
- Answer questions on yoga, meditation, breathwork (pranayama), sleep hygiene, mindful nutrition, stress regulation, and daily habits.
- Reference FlowState Knowledge Hub topics (e.g., Nervous System & Vagal Tone, Ayurveda Dosha Rhythms, Diaphragmatic Breath Science, Mindful Eating, Sleep Architecture) and Yoga/Meditation/Breathing modules when relevant.
- Distinguish clearly between traditional wellness/Ayurvedic practices and established clinical or physiological evidence.
Safety rules:
- Never diagnose conditions, prescribe treatments, or promise clinical cures.
- Encourage consulting a healthcare professional when symptoms persist or involve medical risks.
- Adapt directly to the user's specific question and prior conversation context; never give generic canned answers.`;

    const historyContents = rawHistory
      .filter(
        (item: any) =>
          item &&
          (item.role === 'user' || item.role === 'model') &&
          typeof item.text === 'string' &&
          item.text.trim().length > 0
      )
      .map((item: any) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: sanitizeText(item.text, 2500) }],
      }));

    return { modelChoice, language, systemInstruction, historyContents };
  }

  async function generateFollowUps(
    ai: GoogleGenAI,
    language: string,
    message: string,
    reply: string
  ): Promise<string[]> {
    try {
      const followUpResp = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Based on this wellness conversation in ${language}, suggest 3 short, natural follow-up questions the user might ask next (under 10 words each).
User asked: "${message}"
Assistant replied: "${reply.slice(0, 600)}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });
      const parsed = JSON.parse(followUpResp.text || '[]');
      if (Array.isArray(parsed)) {
        return parsed
          .filter((q) => typeof q === 'string' && q.trim().length > 0)
          .slice(0, 3);
      }
    } catch {
      // Non-fatal if follow-up suggestions fail
    }
    return [];
  }

  // Gemini AI Wellness Assistant & Yoga Coach (Streaming SSE)
  app.post('/api/ai/chat/stream', aiRateLimiter, async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'Gemini AI is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to activate live coaching.',
      });
    }

    const message = sanitizeText(req.body?.message, 1500);
    if (!message) {
      return res.status(400).json({ error: 'Please enter a message or question.' });
    }

    const { modelChoice, language, systemInstruction, historyContents } = buildChatConfig(req.body);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload: Record<string, unknown>) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    };

    try {
      const chat = ai.chats.create({
        model: modelChoice,
        history: historyContents,
        config: {
          systemInstruction,
        },
      });

      const stream = await chat.sendMessageStream({ message });
      let fullReply = '';

      for await (const chunk of stream) {
        const piece = chunk.text || '';
        if (piece) {
          fullReply += piece;
          sendEvent({ type: 'chunk', text: piece });
        }
      }

      if (!fullReply.trim()) {
        sendEvent({
          type: 'error',
          error: 'Gemini returned an empty response. Please try again.',
        });
        res.end();
        return;
      }

      const suggestedFollowUps = await generateFollowUps(ai, language, message, fullReply);
      sendEvent({
        type: 'done',
        reply: fullReply.trim(),
        model: modelChoice,
        suggestedFollowUps,
      });
      res.end();
    } catch (err: any) {
      console.error('Gemini chat stream error:', err);
      sendEvent({
        type: 'error',
        error:
          err?.message ||
          'Unable to reach Gemini AI right now. Please check your API key in Settings > Secrets and try again.',
      });
      res.end();
    }
  });

  // Gemini AI Wellness Assistant & Yoga Coach (JSON)
  app.post('/api/ai/chat', aiRateLimiter, async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'Gemini AI is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to activate live coaching.',
      });
    }

    const message = sanitizeText(req.body?.message, 1500);
    if (!message) {
      return res.status(400).json({ error: 'Please enter a message or question.' });
    }

    const { modelChoice, language, systemInstruction, historyContents } = buildChatConfig(req.body);

    try {
      const chat = ai.chats.create({
        model: modelChoice,
        history: historyContents,
        config: {
          systemInstruction,
        },
      });

      const response = await chat.sendMessage({ message });
      const reply = response.text?.trim();
      if (!reply) {
        return res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
      }

      const suggestedFollowUps = await generateFollowUps(ai, language, message, reply);
      res.json({ reply, model: modelChoice, suggestedFollowUps });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      const status = err?.status || 500;
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error:
          err?.message ||
          'Unable to reach Gemini AI right now. Please check your API key in Settings > Secrets and try again.',
      });
    }
  });

  // Gemini AI Daily Wellness Planner Generator
  app.post('/api/ai/planner', aiRateLimiter, async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI is not configured on the server.',
      });
    }

    const goal = sanitizeText(req.body?.goal, 120) || 'Stress Relief & Balance';
    const availableMinutes = Math.min(180, Math.max(10, Number(req.body?.availableMinutes) || 30));
    const experienceLevel = sanitizeText(req.body?.experienceLevel, 30) || 'Beginner';
    const preferredTime = sanitizeText(req.body?.preferredTime, 30) || 'Morning';
    const recentMood = sanitizeText(req.body?.recentMood, 30);

    try {
      const prompt = `Create a realistic, balanced daily holistic wellness schedule for a ${experienceLevel} practitioner whose primary goal is "${goal}", with ${availableMinutes} minutes of dedicated practice time, preferring ${preferredTime} practice${recentMood ? `, and currently feeling ${recentMood}` : ''}.
Include 6 practical blocks across the day: Morning Routine, Yoga Session, Breathing Exercise, Meditation, Hydration Reminder, and Evening Relaxation.
Keep each title concise and each description actionable (1-2 sentences).`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a holistic wellness planner. Return strictly structured JSON schedule items without medical claims.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timeSlot: { type: Type.STRING, description: 'e.g. 07:00 AM' },
                category: {
                  type: Type.STRING,
                  description: 'One of: Morning Routine, Yoga, Breathing, Meditation, Hydration, Evening Wind-Down',
                },
                title: { type: Type.STRING },
                durationMinutes: { type: Type.INTEGER },
                description: { type: Type.STRING },
              },
              required: ['timeSlot', 'category', 'title', 'durationMinutes', 'description'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return res.status(502).json({ error: 'Planner returned an empty schedule.' });
      }
      res.json({ items: parsed.slice(0, 8) });
    } catch (err: any) {
      console.error('Gemini planner error:', err);
      res.status(500).json({
        error: err?.message || 'Unable to generate AI daily plan right now.',
      });
    }
  });

  // Vite middleware in development, static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FlowState Wellness server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
