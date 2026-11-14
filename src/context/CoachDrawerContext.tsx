import React, { createContext, useCallback, useContext, useState } from 'react';
import { AICoachDrawer } from '../components/AICoachDrawer';

interface OpenCoachOptions {
  mode?: 'assistant' | 'yoga-coach';
  prompt?: string;
  activeContext?: string;
  autoSend?: boolean;
}

interface CoachDrawerContextValue {
  openCoach: (options?: OpenCoachOptions) => void;
  closeCoach: () => void;
}

const CoachDrawerContext = createContext<CoachDrawerContextValue | null>(null);

export const CoachDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'assistant' | 'yoga-coach'>('yoga-coach');
  const [prompt, setPrompt] = useState('');
  const [activeContext, setActiveContext] = useState('');
  const [autoSend, setAutoSend] = useState(false);

  const openCoach = useCallback((options?: OpenCoachOptions) => {
    setMode(options?.mode || 'yoga-coach');
    setPrompt(options?.prompt || '');
    setActiveContext(options?.activeContext || '');
    setAutoSend(Boolean(options?.autoSend));
    setOpen(true);
  }, []);

  const closeCoach = useCallback(() => {
    setOpen(false);
    setAutoSend(false);
  }, []);

  return (
    <CoachDrawerContext.Provider value={{ openCoach, closeCoach }}>
      {children}
      <AICoachDrawer
        open={open}
        onClose={closeCoach}
        initialMode={mode}
        initialPrompt={prompt}
        activeContext={activeContext}
        autoSend={autoSend}
      />
    </CoachDrawerContext.Provider>
  );
};

export function useCoachDrawer() {
  const ctx = useContext(CoachDrawerContext);
  if (!ctx) {
    throw new Error('useCoachDrawer must be used inside CoachDrawerProvider');
  }
  return ctx;
}
