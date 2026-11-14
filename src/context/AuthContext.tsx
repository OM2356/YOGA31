import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  getCachedAccessToken,
  clearCachedAccessToken,
  isBootstrapAdminUser,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL: string;
  ageRange: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  preferredPracticeTime: 'Morning' | 'Midday' | 'Evening' | 'Flexible';
  availableMinutes: number;
  primaryGoals: string[];
  preferredStyles: string[];
  waterGlassesToday: number;
  waterGoal: number;
  waterDateKey: string;
  themePreference: 'light' | 'dark';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ReminderRule {
  id: string;
  label: string;
  category: 'Yoga' | 'Meditation' | 'Hydration' | 'Breathing' | 'Daily Goal';
  time: string;
  enabled: boolean;
}

export interface UserProgress {
  userId: string;
  favoritePoses: string[];
  completedPoses: string[];
  favoriteMeditations: string[];
  bookmarkedArticles: string[];
  readArticles: string[];
  completedLessons: string[];
  quizScores: Record<string, number>;
  reminders: ReminderRule[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PracticeLog {
  id: string;
  userId: string;
  type: 'yoga' | 'meditation' | 'breathing';
  itemId: string;
  title: string;
  category: string;
  durationMinutes: number;
  dateKey: string;
  notes: string;
  createdAt?: Timestamp;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: 'Happy' | 'Calm' | 'Neutral' | 'Stressed' | 'Tired' | 'Anxious';
  energyLevel: number;
  dateKey: string;
  note: string;
  createdAt?: Timestamp;
}

export interface DailyPlanItem {
  id: string;
  timeSlot: string;
  category: string;
  title: string;
  durationMinutes: number;
  description: string;
  status: 'pending' | 'completed' | 'skipped';
}

export interface DailyPlan {
  id: string;
  userId: string;
  dateKey: string;
  goal: string;
  availableMinutes: number;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  preferredTime: 'Morning' | 'Midday' | 'Evening' | 'Flexible';
  items: DailyPlanItem[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ChallengeEnrollment {
  id: string;
  userId: string;
  challengeId: string;
  title: string;
  durationDays: number;
  completedDays: number[];
  status: 'active' | 'completed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  mode: 'assistant' | 'yoga-coach';
  language: 'English' | 'Hindi' | 'Marathi';
  title: string;
  messages: AiChatMessage[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CustomContentItem {
  id: string;
  authorId: string;
  contentType: 'asana' | 'meditation' | 'article' | 'challenge';
  title: string;
  subtitle: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  body: string;
  published: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  profile: UserProfile | null;
  progress: UserProgress | null;
  practiceLogs: PracticeLog[];
  moodEntries: MoodEntry[];
  dailyPlans: DailyPlan[];
  enrollments: ChallengeEnrollment[];
  conversations: AiConversation[];
  customContent: CustomContentItem[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileFields: (fields: Partial<UserProfile>) => Promise<void>;
  updateWaterIntake: (glasses: number, goal?: number) => Promise<void>;
  updateProgressFields: (fields: Partial<UserProgress>) => Promise<void>;
  logPractice: (entry: Omit<PracticeLog, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deletePracticeLog: (id: string) => Promise<void>;
  logMood: (entry: Omit<MoodEntry, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  saveDailyPlan: (plan: Omit<DailyPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, existingId?: string) => Promise<string>;
  deleteDailyPlan: (id: string) => Promise<void>;
  enrollChallenge: (challengeId: string, title: string, durationDays: number) => Promise<void>;
  toggleChallengeDay: (enrollment: ChallengeEnrollment, day: number) => Promise<void>;
  saveConversation: (
    conv: Omit<AiConversation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_REMINDERS: ReminderRule[] = [
  { id: 'rem-yoga', label: 'Morning Mobility & Asana', category: 'Yoga', time: '07:30', enabled: false },
  { id: 'rem-hydration', label: 'Afternoon Hydration Check', category: 'Hydration', time: '14:00', enabled: false },
  { id: 'rem-meditation', label: 'Evening Unwind Sit', category: 'Meditation', time: '20:30', enabled: false },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [enrollments, setEnrollments] = useState<ChallengeEnrollment[]>([]);
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [customContent, setCustomContent] = useState<CustomContentItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('flowstate-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('flowstate-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (profile?.themePreference && profile.themePreference !== theme) {
      setTheme(profile.themePreference);
    }
  }, [profile?.themePreference]);

  // Listen for published admin custom content
  useEffect(() => {
    const q = query(collection(db, 'customContent'), where('published', '==', true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCustomContent(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CustomContentItem, 'id'>) })));
      },
      (err) => {
        console.warn('Custom content listener info:', err.message);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAccessToken(firebaseUser ? getCachedAccessToken() : null);
      if (!firebaseUser) {
        clearCachedAccessToken();
        setProfile(null);
        setProgress(null);
        setPracticeLogs([]);
        setMoodEntries([]);
        setDailyPlans([]);
        setEnrollments([]);
        setConversations([]);
      }
      setAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  // Attach user Firestore listeners ONLY when authenticated
  useEffect(() => {
    if (!authReady || !user) return;
    const uid = user.uid;
    const todayKey = getTodayKey();

    const profileRef = doc(db, 'userProfiles', uid);
    const unsubProfile = onSnapshot(
      profileRef,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          // Auto-reset water counter on a new calendar day
          if (data.waterDateKey !== todayKey) {
            try {
              await updateDoc(profileRef, {
                waterGlassesToday: 0,
                waterDateKey: todayKey,
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `userProfiles/${uid}`);
            }
          } else {
            setProfile(data);
          }
        } else {
          const newProfile: Record<string, unknown> = {
            userId: uid,
            displayName: (user.displayName || 'FlowState Member').slice(0, 100),
            email: (user.email || 'member@flowstate.local').slice(0, 160),
            photoURL: (user.photoURL || '').slice(0, 500),
            ageRange: '25-34',
            experienceLevel: 'Beginner',
            preferredPracticeTime: 'Morning',
            availableMinutes: 20,
            primaryGoals: ['Stress Relief', 'Flexibility'],
            preferredStyles: ['Hatha Yoga', 'Mindfulness'],
            waterGlassesToday: 0,
            waterGoal: 8,
            waterDateKey: todayKey,
            themePreference: theme,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          try {
            await setDoc(profileRef, newProfile);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `userProfiles/${uid}`);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `userProfiles/${uid}`)
    );

    const progressRef = doc(db, 'userProgress', uid);
    const unsubProgress = onSnapshot(
      progressRef,
      async (snap) => {
        if (snap.exists()) {
          setProgress(snap.data() as UserProgress);
        } else {
          const initProgress = {
            userId: uid,
            favoritePoses: [],
            completedPoses: [],
            favoriteMeditations: [],
            bookmarkedArticles: [],
            readArticles: [],
            completedLessons: [],
            quizScores: {},
            reminders: DEFAULT_REMINDERS,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          try {
            await setDoc(progressRef, initProgress);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `userProgress/${uid}`);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `userProgress/${uid}`)
    );

    const toMillis = (ts?: Timestamp) => (ts && typeof ts.toMillis === 'function' ? ts.toMillis() : Date.now());

    const logsQ = query(
      collection(db, 'practiceLogs'),
      where('userId', '==', uid)
    );
    const unsubLogs = onSnapshot(
      logsQ,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<PracticeLog, 'id'>) }))
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setPracticeLogs(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'practiceLogs')
    );

    const moodQ = query(
      collection(db, 'moodEntries'),
      where('userId', '==', uid)
    );
    const unsubMood = onSnapshot(
      moodQ,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<MoodEntry, 'id'>) }))
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setMoodEntries(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'moodEntries')
    );

    const plansQ = query(
      collection(db, 'dailyPlans'),
      where('userId', '==', uid)
    );
    const unsubPlans = onSnapshot(
      plansQ,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<DailyPlan, 'id'>) }))
          .sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
        setDailyPlans(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'dailyPlans')
    );

    const enrollQ = query(
      collection(db, 'challengeEnrollments'),
      where('userId', '==', uid)
    );
    const unsubEnroll = onSnapshot(
      enrollQ,
      (snap) => {
        setEnrollments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChallengeEnrollment, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'challengeEnrollments')
    );

    const convQ = query(
      collection(db, 'aiConversations'),
      where('userId', '==', uid)
    );
    const unsubConv = onSnapshot(
      convQ,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<AiConversation, 'id'>) }))
          .sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
        setConversations(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'aiConversations')
    );

    return () => {
      unsubProfile();
      unsubProgress();
      unsubLogs();
      unsubMood();
      unsubPlans();
      unsubEnroll();
      unsubConv();
    };
  }, [authReady, user]);

  const signIn = useCallback(async () => {
    const res = await signInWithGoogle();
    setAccessToken(res.accessToken);
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setAccessToken(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (user) {
        updateDoc(doc(db, 'userProfiles', user.uid), {
          themePreference: next,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
      return next;
    });
  }, [user]);

  const updateProfileFields = useCallback(
    async (fields: Partial<UserProfile>) => {
      if (!user) return;
      const ref = doc(db, 'userProfiles', user.uid);
      const safeFields: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (fields.displayName !== undefined) safeFields.displayName = fields.displayName.trim().slice(0, 100);
      if (fields.ageRange !== undefined) safeFields.ageRange = fields.ageRange;
      if (fields.experienceLevel !== undefined) safeFields.experienceLevel = fields.experienceLevel;
      if (fields.preferredPracticeTime !== undefined) safeFields.preferredPracticeTime = fields.preferredPracticeTime;
      if (fields.availableMinutes !== undefined) safeFields.availableMinutes = Math.min(180, Math.max(5, Math.round(fields.availableMinutes)));
      if (fields.primaryGoals !== undefined) safeFields.primaryGoals = fields.primaryGoals.slice(0, 6);
      if (fields.preferredStyles !== undefined) safeFields.preferredStyles = fields.preferredStyles.slice(0, 6);
      if (fields.themePreference !== undefined) safeFields.themePreference = fields.themePreference;

      try {
        await updateDoc(ref, safeFields);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `userProfiles/${user.uid}`);
      }
    },
    [user]
  );

  const updateWaterIntake = useCallback(
    async (glasses: number, goal?: number) => {
      if (!user) return;
      const ref = doc(db, 'userProfiles', user.uid);
      const clamped = Math.min(24, Math.max(0, Math.round(glasses)));
      const clampedGoal = Math.min(20, Math.max(1, Math.round(goal ?? profile?.waterGoal ?? 8)));
      try {
        await updateDoc(ref, {
          waterGlassesToday: clamped,
          waterGoal: clampedGoal,
          waterDateKey: getTodayKey(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `userProfiles/${user.uid}`);
      }
    },
    [user, profile?.waterGoal]
  );

  const updateProgressFields = useCallback(
    async (fields: Partial<UserProgress>) => {
      if (!user) return;
      const ref = doc(db, 'userProgress', user.uid);
      const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (fields.favoritePoses !== undefined) payload.favoritePoses = fields.favoritePoses.slice(0, 50);
      if (fields.completedPoses !== undefined) payload.completedPoses = fields.completedPoses.slice(0, 50);
      if (fields.favoriteMeditations !== undefined) payload.favoriteMeditations = fields.favoriteMeditations.slice(0, 50);
      if (fields.bookmarkedArticles !== undefined) payload.bookmarkedArticles = fields.bookmarkedArticles.slice(0, 50);
      if (fields.readArticles !== undefined) payload.readArticles = fields.readArticles.slice(0, 50);
      if (fields.completedLessons !== undefined) payload.completedLessons = fields.completedLessons.slice(0, 80);
      if (fields.quizScores !== undefined) payload.quizScores = fields.quizScores;
      if (fields.reminders !== undefined) payload.reminders = fields.reminders.slice(0, 10);

      try {
        await updateDoc(ref, payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `userProgress/${user.uid}`);
      }
    },
    [user]
  );

  const logPractice = useCallback(
    async (entry: Omit<PracticeLog, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) return;
      try {
        await addDoc(collection(db, 'practiceLogs'), {
          userId: user.uid,
          type: entry.type,
          itemId: entry.itemId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128),
          title: entry.title.trim().slice(0, 160),
          category: entry.category.trim().slice(0, 80),
          durationMinutes: Math.min(240, Math.max(1, Math.round(entry.durationMinutes))),
          dateKey: entry.dateKey,
          notes: (entry.notes || '').trim().slice(0, 500),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'practiceLogs');
      }
    },
    [user]
  );

  const deletePracticeLog = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, 'practiceLogs', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `practiceLogs/${id}`);
      }
    },
    [user]
  );

  const logMood = useCallback(
    async (entry: Omit<MoodEntry, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) return;
      try {
        await addDoc(collection(db, 'moodEntries'), {
          userId: user.uid,
          mood: entry.mood,
          energyLevel: Math.min(5, Math.max(1, Math.round(entry.energyLevel))),
          dateKey: entry.dateKey,
          note: (entry.note || '').trim().slice(0, 500),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'moodEntries');
      }
    },
    [user]
  );

  const saveDailyPlan = useCallback(
    async (
      plan: Omit<DailyPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
      existingId?: string
    ): Promise<string> => {
      if (!user) return '';
      const trimmedItems = plan.items.slice(0, 12);
      if (existingId) {
        try {
          await updateDoc(doc(db, 'dailyPlans', existingId), {
            goal: plan.goal.trim().slice(0, 120),
            availableMinutes: Math.min(240, Math.max(5, Math.round(plan.availableMinutes))),
            experienceLevel: plan.experienceLevel,
            preferredTime: plan.preferredTime,
            items: trimmedItems,
            updatedAt: serverTimestamp(),
          });
          return existingId;
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `dailyPlans/${existingId}`);
        }
      }
      try {
        const ref = await addDoc(collection(db, 'dailyPlans'), {
          userId: user.uid,
          dateKey: plan.dateKey,
          goal: plan.goal.trim().slice(0, 120),
          availableMinutes: Math.min(240, Math.max(5, Math.round(plan.availableMinutes))),
          experienceLevel: plan.experienceLevel,
          preferredTime: plan.preferredTime,
          items: trimmedItems,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'dailyPlans');
      }
    },
    [user]
  );

  const deleteDailyPlan = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, 'dailyPlans', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `dailyPlans/${id}`);
      }
    },
    [user]
  );

  const enrollChallenge = useCallback(
    async (challengeId: string, title: string, durationDays: number) => {
      if (!user) return;
      try {
        await addDoc(collection(db, 'challengeEnrollments'), {
          userId: user.uid,
          challengeId,
          title: title.slice(0, 160),
          durationDays: Math.min(31, Math.max(1, durationDays)),
          completedDays: [],
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'challengeEnrollments');
      }
    },
    [user]
  );

  const toggleChallengeDay = useCallback(
    async (enrollment: ChallengeEnrollment, day: number) => {
      if (!user) return;
      const exists = enrollment.completedDays.includes(day);
      const nextDays = exists
        ? enrollment.completedDays.filter((d) => d !== day)
        : [...enrollment.completedDays, day].sort((a, b) => a - b);
      const nextStatus: 'active' | 'completed' =
        nextDays.length >= enrollment.durationDays ? 'completed' : 'active';
      try {
        await updateDoc(doc(db, 'challengeEnrollments', enrollment.id), {
          completedDays: nextDays.slice(0, 31),
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `challengeEnrollments/${enrollment.id}`);
      }
    },
    [user]
  );

  const saveConversation = useCallback(
    async (
      conv: Omit<AiConversation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
      existingId?: string
    ): Promise<string> => {
      if (!user) return '';
      const msgs = conv.messages.slice(-40);
      if (existingId) {
        try {
          await updateDoc(doc(db, 'aiConversations', existingId), {
            title: conv.title.trim().slice(0, 140),
            language: conv.language,
            messages: msgs,
            updatedAt: serverTimestamp(),
          });
          return existingId;
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `aiConversations/${existingId}`);
        }
      }
      try {
        const ref = await addDoc(collection(db, 'aiConversations'), {
          userId: user.uid,
          mode: conv.mode,
          language: conv.language,
          title: conv.title.trim().slice(0, 140),
          messages: msgs,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'aiConversations');
      }
    },
    [user]
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, 'aiConversations', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `aiConversations/${id}`);
      }
    },
    [user]
  );

  const isAdmin = isBootstrapAdminUser(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        accessToken,
        profile,
        progress,
        practiceLogs,
        moodEntries,
        dailyPlans,
        enrollments,
        conversations,
        customContent,
        theme,
        toggleTheme,
        signIn,
        signOut,
        updateProfileFields,
        updateWaterIntake,
        updateProgressFields,
        logPractice,
        deletePracticeLog,
        logMood,
        saveDailyPlan,
        deleteDailyPlan,
        enrollChallenge,
        toggleChallengeDay,
        saveConversation,
        deleteConversation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
