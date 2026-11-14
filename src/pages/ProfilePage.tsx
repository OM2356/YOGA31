import React, { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '../context/AuthContext';

const GOAL_OPTIONS = [
  'Stress Relief',
  'Flexibility',
  'Core Strength',
  'Better Sleep',
  'Back Care',
  'Daily Mindfulness',
];

const STYLE_OPTIONS = [
  'Hatha Yoga',
  'Vinyasa Flow',
  'Restorative',
  'Pranayama',
  'Mindfulness',
  'Yoga Nidra',
];

export const ProfilePage: React.FC = () => {
  const { user, profile, theme, toggleTheme, updateProfileFields, updateWaterIntake, signOut } =
    useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [ageRange, setAgeRange] = useState<UserProfile['ageRange']>(profile?.ageRange || '25-34');
  const [experienceLevel, setExperienceLevel] = useState<UserProfile['experienceLevel']>(
    profile?.experienceLevel || 'Beginner'
  );
  const [preferredPracticeTime, setPreferredPracticeTime] = useState<
    UserProfile['preferredPracticeTime']
  >(profile?.preferredPracticeTime || 'Morning');
  const [availableMinutes, setAvailableMinutes] = useState(profile?.availableMinutes || 20);
  const [waterGoal, setWaterGoal] = useState(profile?.waterGoal || 8);
  const [primaryGoals, setPrimaryGoals] = useState<string[]>(profile?.primaryGoals || []);
  const [preferredStyles, setPreferredStyles] = useState<string[]>(
    profile?.preferredStyles || []
  );
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setAgeRange(profile.ageRange);
      setExperienceLevel(profile.experienceLevel);
      setPreferredPracticeTime(profile.preferredPracticeTime);
      setAvailableMinutes(profile.availableMinutes);
      setWaterGoal(profile.waterGoal);
      setPrimaryGoals(profile.primaryGoals);
      setPreferredStyles(profile.preferredStyles);
    }
  }, [profile]);

  const toggleItem = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((i) => i !== value));
    } else if (list.length < 6) {
      setList([...list, value]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    try {
      await updateProfileFields({
        displayName: displayName || user?.displayName || 'Member',
        ageRange,
        experienceLevel,
        preferredPracticeTime,
        availableMinutes,
        primaryGoals,
        preferredStyles,
      });
      await updateWaterIntake(profile?.waterGlassesToday ?? 0, waterGoal);
      setSavedMsg('Profile preferences saved to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2F5D46] text-lg font-semibold text-white">
              {(displayName || 'F').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-display text-xl font-semibold">
              {profile?.displayName || user?.displayName || 'FlowState Member'}
            </h2>
            <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-[#D7DDD6] px-3 py-2 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33]"
          >
            Theme: {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="rounded-lg border border-[#D7DDD6] px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-[#2C3A33] dark:text-red-300 dark:hover:bg-red-950/30"
          >
            Sign Out
          </button>
        </div>
      </section>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]"
      >
        <h3 className="font-display text-lg font-semibold">Wellness Preferences &amp; Settings</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Display Name
            <input
              type="text"
              required
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm text-[#18221D] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#EEF2EE]"
            />
          </label>

          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Age Range
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value as UserProfile['ageRange'])}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            >
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55+">55+</option>
            </select>
          </label>

          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Fitness &amp; Yoga Level
            <select
              value={experienceLevel}
              onChange={(e) =>
                setExperienceLevel(e.target.value as UserProfile['experienceLevel'])
              }
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>

          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Preferred Practice Time
            <select
              value={preferredPracticeTime}
              onChange={(e) =>
                setPreferredPracticeTime(e.target.value as UserProfile['preferredPracticeTime'])
              }
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            >
              <option value="Morning">Morning</option>
              <option value="Midday">Midday</option>
              <option value="Evening">Evening</option>
              <option value="Flexible">Flexible</option>
            </select>
          </label>

          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Available Daily Practice (min)
            <input
              type="number"
              min={5}
              max={180}
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(Math.max(5, Number(e.target.value)))}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            />
          </label>

          <label className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Daily Hydration Goal (glasses)
            <input
              type="number"
              min={1}
              max={20}
              value={waterGoal}
              onChange={(e) => setWaterGoal(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            />
          </label>
        </div>

        <div>
          <p className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Wellness Goals (select up to 6)
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleItem(primaryGoals, setPrimaryGoals, g)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  primaryGoals.includes(g)
                    ? 'border-[#2F5D46] bg-[#2F5D46] text-white'
                    : 'border-[#D7DDD6] bg-[#F8F7F4] dark:border-[#2C3A33] dark:bg-[#111915]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Preferred Yoga &amp; Meditation Styles
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleItem(preferredStyles, setPreferredStyles, s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  preferredStyles.includes(s)
                    ? 'border-[#2F5D46] bg-[#2F5D46] text-white'
                    : 'border-[#D7DDD6] bg-[#F8F7F4] dark:border-[#2C3A33] dark:bg-[#111915]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#2F5D46] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#264C39] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          {savedMsg && (
            <span className="text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
              {savedMsg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
