export interface StreamChatParams {
  message: string;
  mode: 'assistant' | 'yoga-coach';
  language: 'English' | 'Hindi' | 'Marathi';
  speed?: 'balanced' | 'fast';
  history: { role: 'user' | 'model'; text: string }[];
  userContext?: Record<string, unknown>;
  onChunk: (partialReply: string) => void;
}

export interface StreamChatResult {
  reply: string;
  suggestedFollowUps: string[];
  model?: string;
}

export async function sendGeminiChatStream(params: StreamChatParams): Promise<StreamChatResult> {
  const resp = await fetch('/api/ai/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: params.message,
      mode: params.mode,
      language: params.language,
      speed: params.speed || 'balanced',
      history: params.history,
      userContext: params.userContext,
    }),
  });

  if (!resp.ok) {
    let errorMessage = `Request failed with status ${resp.status}`;
    try {
      const errData = await resp.json();
      if (errData?.error) errorMessage = errData.error;
    } catch {
      // Ignore JSON parse fallback failure
    }
    throw new Error(errorMessage);
  }

  if (!resp.body) {
    throw new Error('Streaming response body is unavailable.');
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';
  let suggestedFollowUps: string[] = [];
  let modelUsed: string | undefined;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      const dataLine = block
        .split('\n')
        .find((line) => line.startsWith('data: '));
      if (!dataLine) continue;

      const jsonStr = dataLine.slice(6).trim();
      if (!jsonStr) continue;

      let event: any;
      try {
        event = JSON.parse(jsonStr);
      } catch {
        continue;
      }

      if (event.type === 'chunk' && typeof event.text === 'string') {
        accumulated += event.text;
        params.onChunk(accumulated);
      } else if (event.type === 'error') {
        throw new Error(event.error || 'Gemini streaming encountered an error.');
      } else if (event.type === 'done') {
        accumulated = typeof event.reply === 'string' && event.reply ? event.reply : accumulated;
        suggestedFollowUps = Array.isArray(event.suggestedFollowUps)
          ? event.suggestedFollowUps
          : [];
        modelUsed = typeof event.model === 'string' ? event.model : undefined;
      }
    }
  }

  if (!accumulated.trim()) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  return {
    reply: accumulated.trim(),
    suggestedFollowUps,
    model: modelUsed,
  };
}
