import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Plus, Trash2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CustomContentItem, UserProfile, useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [contentList, setContentList] = useState<CustomContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Create custom content form
  const [contentType, setContentType] = useState<CustomContentItem['contentType']>('asana');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Beginner Yoga');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const usersSnap = await getDocs(collection(db, 'userProfiles'));
      setUsersList(usersSnap.docs.map((d) => d.data() as UserProfile));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'userProfiles');
    }

    try {
      const contentSnap = await getDocs(collection(db, 'customContent'));
      setContentList(
        contentSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CustomContentItem, 'id'>),
        }))
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'customContent');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData().catch((err) => setErrorMsg(err?.message || 'Unable to load admin data.'));
    }
  }, [isAdmin]);

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'customContent'), {
        authorId: user.uid,
        contentType,
        title: title.trim().slice(0, 160),
        subtitle: subtitle.trim().slice(0, 240),
        category: category.trim().slice(0, 80),
        difficulty: difficulty.trim().slice(0, 40),
        durationMinutes: Math.min(180, Math.max(1, Math.round(durationMinutes))),
        body: body.trim().slice(0, 4000),
        published: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTitle('');
      setSubtitle('');
      setBody('');
      await loadAdminData();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'customContent');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (item: CustomContentItem) => {
    try {
      await updateDoc(doc(db, 'customContent', item.id), {
        published: !item.published,
        updatedAt: serverTimestamp(),
      });
      await loadAdminData();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customContent/${item.id}`);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customContent', id));
      await loadAdminData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `customContent/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
        <h2 className="font-display text-2xl font-semibold">Admin Console</h2>
        <p className="mt-1 text-sm text-[#526058] dark:text-[#A9B6AE]">
          Manage registered practitioners and publish additional yoga asanas, meditations, articles, and challenges.
        </p>
        {errorMsg && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {errorMsg}
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Publish New Resource */}
        <form
          onSubmit={handleCreateContent}
          className="space-y-4 rounded-xl border border-[#E2E6DF] bg-white p-6 lg:col-span-5 dark:border-[#24322B] dark:bg-[#16201B]"
        >
          <h3 className="font-display text-lg font-semibold">Publish Catalog Content</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium">
              Content Type
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
              >
                <option value="asana">Yoga Asana</option>
                <option value="meditation">Meditation</option>
                <option value="article">Knowledge Article</option>
                <option value="challenge">Challenge</option>
              </select>
            </label>
            <label className="text-xs font-medium">
              Duration / Days
              <input
                type="number"
                min={1}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 font-mono text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
              />
            </label>
          </div>
          <label className="block text-xs font-medium">
            Title
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sukhasana (Easy Pose)"
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            />
          </label>
          <label className="block text-xs font-medium">
            Subtitle / Sanskrit / Badge Name
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Optional subtitle"
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium">
              Category
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
              />
            </label>
            <label className="text-xs font-medium">
              Difficulty
              <input
                type="text"
                required
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] px-3 py-2 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
              />
            </label>
          </div>
          <label className="block text-xs font-medium">
            Content / Steps / Article Body
            <textarea
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] p-3 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5D46] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#264C39] disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{submitting ? 'Publishing...' : 'Publish Item'}</span>
          </button>
        </form>

        {/* Registered Users & Custom Content */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <h3 className="font-display text-lg font-semibold">
              Registered Users ({usersList.length})
            </h3>
            {loading ? (
              <p className="mt-3 text-xs text-[#5B6860]">Loading practitioners...</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E2E6DF] text-[#5B6860] dark:border-[#24322B]">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Member</th>
                      <th className="py-2 pr-4 font-medium">Level</th>
                      <th className="py-2 pr-4 font-medium">Preferred</th>
                      <th className="py-2 text-right font-medium">Daily Goal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E6DF] dark:divide-[#24322B]">
                    {usersList.map((u) => (
                      <tr key={u.userId}>
                        <td className="py-2.5 pr-4">
                          <p className="font-semibold">{u.displayName}</p>
                          <p className="text-[#5B6860]">{u.email}</p>
                        </td>
                        <td className="py-2.5 pr-4">{u.experienceLevel}</td>
                        <td className="py-2.5 pr-4">{u.preferredPracticeTime}</td>
                        <td className="py-2.5 text-right font-mono tabular-nums">
                          {u.availableMinutes}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
            <h3 className="font-display text-lg font-semibold">
              Curated Custom Content ({contentList.length})
            </h3>
            {contentList.length === 0 ? (
              <p className="mt-2 text-xs text-[#5B6860]">No custom catalog items yet.</p>
            ) : (
              <div className="mt-3 divide-y divide-[#E2E6DF] dark:divide-[#24322B]">
                {contentList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-[#5B6860]">
                        {item.contentType} · {item.category} · {item.difficulty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublish(item)}
                        className={`rounded-lg px-2.5 py-1 font-medium ${
                          item.published
                            ? 'bg-[#2F5D46] text-white'
                            : 'border border-[#D7DDD6] text-[#5B6860]'
                        }`}
                      >
                        {item.published ? 'Published' : 'Draft'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteContent(item.id)}
                        aria-label="Delete custom content"
                        className="rounded p-1 text-[#78857D] hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
