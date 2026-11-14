import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, RefreshCw, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import firebaseConfig from '../../firebase-applet-config.json';

interface ChatSpace {
  name: string;
  displayName?: string;
  spaceType?: string;
}

interface ChatMessage {
  name: string;
  text?: string;
  createTime?: string;
  sender?: {
    displayName?: string;
    type?: string;
  };
}

export const GoogleChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { accessToken, signIn } = useAuth();

  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftText, setDraftText] = useState(searchParams.get('draft') || '');
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isChatAppMissing, setIsChatAppMissing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [connecting, setConnecting] = useState(false);

  const projectId = firebaseConfig.projectId || 'glass-marker-448404-a3';
  const consoleChatUrl = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${projectId}`;

  const fetchSpaces = async (token: string) => {
    setLoadingSpaces(true);
    setErrorMsg('');
    setIsChatAppMissing(false);
    try {
      const resp = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=25', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) {
        const msg = data?.error?.message || `Google Chat API error (${resp.status})`;
        if (resp.status === 404 || msg.includes('Chat app not found')) {
          setIsChatAppMissing(true);
        }
        throw new Error(msg);
      }
      const list: ChatSpace[] = data.spaces || [];
      setSpaces(list);
      if (list.length > 0 && !selectedSpace) {
        setSelectedSpace(list[0]);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to fetch Google Chat spaces.');
    } finally {
      setLoadingSpaces(false);
    }
  };

  const fetchMessages = async (spaceName: string, token: string) => {
    setLoadingMsgs(true);
    setErrorMsg('');
    try {
      const resp = await fetch(
        `https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=25&orderBy=createTime%20desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error?.message || `Failed to load messages (${resp.status})`);
      }
      const list: ChatMessage[] = (data.messages || []).reverse();
      setMessages(list);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load space messages.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSpaces(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && selectedSpace) {
      fetchMessages(selectedSpace.name, accessToken);
    }
  }, [accessToken, selectedSpace?.name]);

  const handleConnect = async () => {
    setConnecting(true);
    setErrorMsg('');
    try {
      await signIn();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google authentication was cancelled.');
    } finally {
      setConnecting(false);
    }
  };

  const executeSendMessage = async () => {
    if (!accessToken || !selectedSpace || !draftText.trim()) return;
    setSending(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const resp = await fetch(`https://chat.googleapis.com/v1/${selectedSpace.name}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: draftText.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error?.message || `Failed to send message (${resp.status})`);
      }
      setConfirmOpen(false);
      setDraftText('');
      setStatusMsg('Wellness update posted to Google Chat.');
      await fetchMessages(selectedSpace.name, accessToken);
    } catch (err: any) {
      setConfirmOpen(false);
      setErrorMsg(err?.message || 'Unable to post message to Google Chat.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Google Chat Wellness Spaces</h2>
            <p className="mt-1 text-sm text-[#526058] dark:text-[#A9B6AE]">
              View your Google Workspace Chat spaces and share daily wellness plans or practice reflections with explicit confirmation before sending.
            </p>
          </div>
          {accessToken && (
            <button
              type="button"
              onClick={() => fetchSpaces(accessToken)}
              disabled={loadingSpaces}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7DDD6] px-3 py-2 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:hover:bg-[#223029]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingSpaces ? 'animate-spin' : ''}`} />
              <span>Refresh Spaces</span>
            </button>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-3.5 text-xs text-[#4A5750] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#B4C2BA]">
          <strong>Workspace Prerequisites:</strong> Google Chat API requires a Business or Enterprise Google Workspace account (consumer @gmail.com accounts are not supported by Chat API) and a configured Chat App in{' '}
          <a
            href={consoleChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#2F5D46] underline dark:text-[#84B89B]"
          >
            <span>Google Cloud Console</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          .
        </div>
      </section>

      {!accessToken ? (
        <section className="rounded-xl border border-[#E2E6DF] bg-white p-8 dark:border-[#24322B] dark:bg-[#16201B]">
          <h3 className="font-display text-xl font-semibold">Authorize Google Chat Access</h3>
          <p className="mt-2 max-w-xl text-sm text-[#526058] dark:text-[#A9B6AE]">
            For your security, Google Chat access tokens are held strictly in memory for your active session. Sign in with Google below to load your Workspace spaces.
          </p>
          {errorMsg && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {errorMsg}
            </p>
          )}
          <div className="mt-5">
            <GoogleSignInButton
              onClick={handleConnect}
              loading={connecting}
              label="Connect Google Chat with Google"
            />
          </div>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Spaces List */}
          <aside className="rounded-xl border border-[#E2E6DF] bg-white p-4 lg:col-span-4 dark:border-[#24322B] dark:bg-[#16201B]">
            <h3 className="text-sm font-semibold">Your Spaces</h3>
            {loadingSpaces ? (
              <div className="mt-4 space-y-2">
                <div className="h-10 animate-pulse rounded-lg bg-[#EFECE6] dark:bg-[#1E2A23]" />
                <div className="h-10 animate-pulse rounded-lg bg-[#EFECE6] dark:bg-[#1E2A23]" />
              </div>
            ) : spaces.length === 0 ? (
              <p className="mt-3 text-xs text-[#5B6860] dark:text-[#98A79E]">
                No Google Chat spaces returned for this account.
              </p>
            ) : (
              <div className="mt-3 space-y-1.5">
                {spaces.map((sp) => (
                  <button
                    key={sp.name}
                    type="button"
                    onClick={() => setSelectedSpace(sp)}
                    className={`w-full rounded-lg border p-3 text-left text-xs transition ${
                      selectedSpace?.name === sp.name
                        ? 'border-[#2F5D46] bg-[#F4F8F5] font-semibold dark:border-[#84B89B] dark:bg-[#1A2921]'
                        : 'border-[#E2E6DF] hover:bg-[#F8F7F4] dark:border-[#24322B] dark:hover:bg-[#1B2720]'
                    }`}
                  >
                    <p className="truncate">{sp.displayName || sp.name}</p>
                    <p className="mt-0.5 text-[11px] font-normal text-[#5B6860] dark:text-[#98A79E]">
                      {sp.spaceType || 'SPACE'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Messages & Composer */}
          <section className="flex flex-col rounded-xl border border-[#E2E6DF] bg-white p-5 lg:col-span-8 dark:border-[#24322B] dark:bg-[#16201B]">
            <div className="border-b border-[#E2E6DF] pb-3 dark:border-[#24322B]">
              <h3 className="text-base font-semibold">
                {selectedSpace ? selectedSpace.displayName || selectedSpace.name : 'Select a space'}
              </h3>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                <p>{errorMsg}</p>
                {isChatAppMissing && (
                  <p className="mt-2">
                    Complete the one-time Chat App configuration (App name, Avatar URL, Description) at:{' '}
                    <a
                      href={consoleChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      Google Chat API Configuration ({projectId})
                    </a>
                  </p>
                )}
              </div>
            )}

            {statusMsg && (
              <p className="mt-3 text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
                {statusMsg}
              </p>
            )}

            <div className="my-4 max-h-80 min-h-[200px] flex-1 space-y-3 overflow-y-auto">
              {loadingMsgs ? (
                <p className="text-xs text-[#5B6860]">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                  No recent messages loaded for this space.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.name}
                    className="rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-3 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
                  >
                    <div className="flex items-center justify-between text-xs text-[#5B6860] dark:text-[#98A79E]">
                      <span className="font-medium text-[#18221D] dark:text-[#EEF2EE]">
                        {msg.sender?.displayName || 'Workspace Member'}
                      </span>
                      {msg.createTime && (
                        <span className="font-mono text-[11px] tabular-nums">
                          {new Date(msg.createTime).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{msg.text || '(Attachment)'}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedSpace && draftText.trim()) setConfirmOpen(true);
              }}
              className="space-y-3 border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]"
            >
              <textarea
                rows={3}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Write a wellness check-in or paste your daily plan to share..."
                className="w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] p-3 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedSpace || !draftText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Review &amp; Send Message</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Mandatory Confirmation Dialog Before Mutating Google Chat */}
      {confirmOpen && selectedSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#E2E6DF] bg-white p-6 shadow-xl dark:border-[#2C3A33] dark:bg-[#16201B]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-semibold">
                Confirm Google Chat Message
              </h3>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                aria-label="Cancel sending message"
                className="rounded p-1 text-[#5B6860] hover:bg-[#EFECE6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-[#526058] dark:text-[#A9B6AE]">
              You are about to post the following message to{' '}
              <strong>{selectedSpace.displayName || selectedSpace.name}</strong>:
            </p>
            <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-3 text-xs whitespace-pre-wrap dark:border-[#2C3A33] dark:bg-[#111915]">
              {draftText}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-[#D7DDD6] px-4 py-2 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendMessage}
                disabled={sending}
                className="rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39] disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
