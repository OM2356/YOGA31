import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  adminOnly?: boolean;
}> = ({ children, adminOnly = false }) => {
  const { user, authReady, isAdmin, signIn } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  if (!authReady) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-12">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[#E7E5DF] dark:bg-[#1E2A23]" />
        <div className="h-44 w-full animate-pulse rounded-xl bg-[#E7E5DF] dark:bg-[#1E2A23]" />
      </div>
    );
  }

  if (!user) {
    const handleLogin = async () => {
      setSigningIn(true);
      setError('');
      try {
        await signIn();
      } catch (err: any) {
        setError(err?.message || 'Sign-in was cancelled or blocked.');
      } finally {
        setSigningIn(false);
      }
    };

    return (
      <div className="mx-auto my-12 max-w-lg rounded-xl border border-[#E2E6DF] bg-white p-8 dark:border-[#2C3A33] dark:bg-[#16201B]">
        <div className="flex items-center gap-3 text-[#2F5D46] dark:text-[#84B89B]">
          <ShieldCheck className="h-6 w-6" />
          <h2 className="font-display text-2xl font-semibold text-[#18221D] dark:text-[#EEF2EE]">
            Sign in to save your wellness sanctuary
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#526058] dark:text-[#A9B6AE]">
          Connect with Google to sync your daily yoga sessions, mood check-ins, personalized AI plans, and Google Chat spaces across sessions.
        </p>
        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="mt-6">
          <GoogleSignInButton onClick={handleLogin} loading={signingIn} />
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="mx-auto my-12 max-w-lg rounded-xl border border-[#E2E6DF] bg-white p-8 dark:border-[#2C3A33] dark:bg-[#16201B]">
        <h2 className="font-display text-xl font-semibold text-[#18221D] dark:text-[#EEF2EE]">
          Administrator Access Required
        </h2>
        <p className="mt-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
          This administrative console is restricted to authorized FlowState Wellness stewards.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
