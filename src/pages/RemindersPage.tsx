import React, { useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { ReminderRule, useAuth } from '../context/AuthContext';

export const RemindersPage: React.FC = () => {
  const { progress, updateProgressFields } = useAuth();
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<ReminderRule['category']>('Yoga');
  const [time, setTime] = useState('08:00');
  const [permState, setPermState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [feedback, setFeedback] = useState('');

  const reminders = progress?.reminders || [];

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      setPermState('unsupported');
      return;
    }
    const res = await Notification.requestPermission();
    setPermState(res);
    if (res === 'granted') {
      new Notification('FlowState Wellness Reminders Enabled', {
        body: 'You will receive browser alerts at your configured wellness times while FlowState is open.',
        icon: '/pwa-192x192.png',
      });
    }
  };

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    if (reminders.length >= 10) {
      setFeedback('Maximum 10 reminder rules supported.');
      return;
    }
    const next: ReminderRule[] = [
      ...reminders,
      {
        id: `rem-${Date.now()}`,
        label: label.trim().slice(0, 80),
        category,
        time,
        enabled: true,
      },
    ];
    await updateProgressFields({ reminders: next });
    setLabel('');
    setFeedback('Reminder saved.');
  };

  const toggleReminder = async (id: string) => {
    const next = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    await updateProgressFields({ reminders: next });
  };

  const removeReminder = async (id: string) => {
    const next = reminders.filter((r) => r.id !== id);
    await updateProgressFields({ reminders: next });
  };

  const sendTestNotification = () => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      setFeedback('Enable browser notifications first to send a test alert.');
      return;
    }
    new Notification('FlowState · Hydration & Posture Check', {
      body: 'Take a slow breath, unclench your shoulders, and sip a glass of water.',
      icon: '/pwa-192x192.png',
    });
    setFeedback('Test notification sent.');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Reminders &amp; Notifications</h2>
            <p className="mt-1 text-sm text-[#526058] dark:text-[#A9B6AE]">
              Configure gentle practice, hydration, and breathing cues. Browser alerts only trigger with your explicit permission.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {permState !== 'granted' ? (
              <button
                type="button"
                onClick={requestPermission}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39]"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Enable Browser Notifications</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={sendTestNotification}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D7DDD6] px-4 py-2 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33]"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Send Test Alert</span>
              </button>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-[#5B6860] dark:text-[#98A79E]">
          Permission status: <strong className="capitalize">{permState}</strong>
        </p>
        {feedback && (
          <p className="mt-2 text-xs font-medium text-[#2F5D46] dark:text-[#84B89B]">
            {feedback}
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <form
          onSubmit={addReminder}
          className="space-y-4 rounded-xl border border-[#E2E6DF] bg-white p-6 lg:col-span-5 dark:border-[#24322B] dark:bg-[#16201B]"
        >
          <h3 className="font-display text-lg font-semibold">Add New Reminder</h3>
          <label className="block text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
            Reminder Label
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Afternoon 5-Min Box Breathing"
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReminderRule['category'])}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
              >
                <option value="Yoga">Yoga</option>
                <option value="Meditation">Meditation</option>
                <option value="Hydration">Hydration</option>
                <option value="Breathing">Breathing</option>
                <option value="Daily Goal">Daily Goal</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-[#526058] dark:text-[#A9B6AE]">
              Time
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
              />
            </label>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5D46] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#264C39]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Save Reminder</span>
          </button>
        </form>

        <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 lg:col-span-7 dark:border-[#24322B] dark:bg-[#16201B]">
          <h3 className="font-display text-lg font-semibold">Configured Reminders</h3>
          {reminders.length === 0 ? (
            <p className="mt-3 text-sm text-[#526058] dark:text-[#A9B6AE]">
              No reminders configured yet.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-[#E2E6DF] dark:divide-[#24322B]">
              {reminders.map((rem) => (
                <div key={rem.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{rem.label}</p>
                    <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                      {rem.category} · <span className="font-mono tabular-nums">{rem.time}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleReminder(rem.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        rem.enabled
                          ? 'bg-[#2F5D46] text-white'
                          : 'border border-[#D7DDD6] text-[#5B6860] dark:border-[#2C3A33]'
                      }`}
                    >
                      {rem.enabled ? 'Active' : 'Paused'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeReminder(rem.id)}
                      aria-label="Delete reminder"
                      className="rounded p-1.5 text-[#78857D] hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
