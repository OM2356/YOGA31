import React, { useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-lg border border-[#D7DDD6] bg-white px-3 py-2 text-xs font-medium text-[#18221D] transition hover:bg-[#EFECE6] whitespace-nowrap shrink-0 dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE] dark:hover:bg-[#223029]"
      >
        <Download className="h-3.5 w-3.5" />
        <span>{compact ? 'Install' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D7DDD6] bg-white px-3 py-2 text-xs font-medium text-[#18221D] transition hover:bg-[#EFECE6] whitespace-nowrap shrink-0 dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE] dark:hover:bg-[#223029]"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl border border-[#E2E6DF] bg-white p-6 shadow-xl dark:border-[#2C3A33] dark:bg-[#16201B]">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                  Install FlowState on iOS
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation instructions"
                  className="rounded-lg p-1 text-[#5B6860] hover:bg-[#EFECE6] dark:text-[#A3B0A8] dark:hover:bg-[#223029]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-[#4A5750] dark:text-[#B8C4BC]">
                <li>1. Tap the Share icon in the Safari toolbar.</li>
                <li>2. Scroll down and select Add to Home Screen.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#2F5D46] py-2 text-sm font-medium text-white hover:bg-[#264C39]"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-700/30 bg-amber-800 px-3 py-2 text-xs font-medium text-white shadow-lg">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline mode — cached content active</span>
    </div>
  );
};
