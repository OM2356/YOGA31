import React, { useMemo, useState } from 'react';
import { Bookmark, Check, Search, X } from 'lucide-react';
import {
  KNOWLEDGE_ARTICLES,
  KNOWLEDGE_CATEGORIES,
  KnowledgeArticle,
} from '../data/wellnessData';
import { useAuth } from '../context/AuthContext';
import { ResilientImage } from '../components/ResilientImage';

export const KnowledgeHubPage: React.FC = () => {
  const { user, progress, customContent, updateProgressFields } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'All' | string>('All');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  const allArticles = useMemo(() => {
    const customArticles: KnowledgeArticle[] = customContent
      .filter((c) => c.contentType === 'article')
      .map((c) => ({
        id: c.id,
        title: c.title,
        category: (KNOWLEDGE_CATEGORIES.includes(c.category as any)
          ? c.category
          : 'Healthy Lifestyle') as KnowledgeArticle['category'],
        readingMinutes: Math.max(2, c.durationMinutes),
        image: KNOWLEDGE_ARTICLES[0].image,
        evidenceNote: 'Curated FlowState editorial resource.',
        summary: c.subtitle || c.body.slice(0, 140),
        paragraphs: c.body.split('\n').filter(Boolean),
        relatedIds: ['art-yoga-science'],
      }));
    return [...KNOWLEDGE_ARTICLES, ...customArticles];
  }, [customContent]);

  const bookmarks = progress?.bookmarkedArticles || [];
  const readArticles = progress?.readArticles || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allArticles.filter((a) => {
      if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
      if (onlyBookmarks && !bookmarks.includes(a.id)) return false;
      if (
        q &&
        !a.title.toLowerCase().includes(q) &&
        !a.summary.toLowerCase().includes(q) &&
        !a.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [allArticles, selectedCategory, onlyBookmarks, bookmarks, search]);

  const toggleBookmark = async (id: string) => {
    if (!user) return;
    const next = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    await updateProgressFields({ bookmarkedArticles: next });
  };

  const toggleRead = async (id: string) => {
    if (!user) return;
    const next = readArticles.includes(id)
      ? readArticles.filter((r) => r !== id)
      : [...readArticles, id];
    await updateProgressFields({ readArticles: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#E2E6DF] bg-white p-6 sm:flex-row sm:items-center dark:border-[#24322B] dark:bg-[#16201B]">
        <div>
          <h2 className="font-display text-2xl font-semibold">Knowledge Hub</h2>
          <p className="mt-1 text-sm text-[#526058] dark:text-[#A9B6AE]">
            Evidence-informed wellness education distinguishing traditional wisdom from clinical research.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6D7A72]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-56 rounded-lg border border-[#D7DDD6] bg-[#F8F7F4] py-2 pl-9 pr-3 text-sm dark:border-[#2C3A33] dark:bg-[#111915]"
            />
          </div>
          <button
            type="button"
            onClick={() => setOnlyBookmarks((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${
              onlyBookmarks
                ? 'border-[#2F5D46] bg-[#2F5D46] text-white'
                : 'border-[#D7DDD6] bg-white text-[#35423B] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#C0CDC5]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            selectedCategory === 'All'
              ? 'bg-[#2F5D46] text-white'
              : 'bg-[#EFECE6] text-[#35423B] dark:bg-[#19241E] dark:text-[#C0CDC5]'
          }`}
        >
          All Topics
        </button>
        {KNOWLEDGE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              selectedCategory === cat
                ? 'bg-[#2F5D46] text-white'
                : 'bg-[#EFECE6] text-[#35423B] dark:bg-[#19241E] dark:text-[#C0CDC5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((art) => {
          const isSaved = bookmarks.includes(art.id);
          const isRead = readArticles.includes(art.id);
          return (
            <article
              key={art.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[#E2E6DF] bg-white dark:border-[#24322B] dark:bg-[#16201B]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#EFECE6] dark:bg-[#1B2720]">
                <ResilientImage
                  src={art.image}
                  alt={art.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                    <span>{art.category}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="tabular-nums">{art.readingMinutes} min read</span>
                    {isRead && <span className="ml-2 font-medium text-[#2F5D46] dark:text-[#84B89B]">· Read</span>}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold leading-snug">{art.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#526058] dark:text-[#A9B6AE]">
                    {art.summary}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(art)}
                    className="rounded-lg bg-[#2F5D46] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#264C39]"
                  >
                    Read Article
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(art.id)}
                    aria-label={isSaved ? 'Remove bookmark' : 'Bookmark article'}
                    className={`rounded-lg border p-2 ${
                      isSaved
                        ? 'border-[#2F5D46] text-[#2F5D46] dark:border-[#84B89B] dark:text-[#84B89B]'
                        : 'border-[#D7DDD6] text-[#5B6860] dark:border-[#2C3A33]'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E2E6DF] bg-white p-6 sm:p-8 dark:border-[#2C3A33] dark:bg-[#16201B]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E6DF] pb-4 dark:border-[#24322B]">
              <div>
                <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
                  {activeArticle.category} · {activeArticle.readingMinutes} min read
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold">
                  {activeArticle.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article reader"
                className="rounded-lg p-2 text-[#5B6860] hover:bg-[#EFECE6] dark:hover:bg-[#223029]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-3.5 text-xs text-[#4A5750] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#B4C2BA]">
              {activeArticle.evidenceNote}
            </div>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#35423B] dark:text-[#C0CDC5]">
              {activeArticle.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
              <button
                type="button"
                onClick={() => toggleRead(activeArticle.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium ${
                  readArticles.includes(activeArticle.id)
                    ? 'bg-[#2F5D46] text-white'
                    : 'border border-[#D7DDD6] hover:bg-[#EFECE6] dark:border-[#2C3A33]'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>
                  {readArticles.includes(activeArticle.id)
                    ? 'Marked as Read'
                    : 'Mark as Read'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleBookmark(activeArticle.id)}
                className="rounded-lg border border-[#D7DDD6] px-4 py-2 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33]"
              >
                {bookmarks.includes(activeArticle.id) ? 'Bookmarked' : 'Save Bookmark'}
              </button>
            </div>

            {activeArticle.relatedIds.length > 0 && (
              <div className="mt-6 border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
                <p className="text-xs font-semibold text-[#5B6860] dark:text-[#98A79E]">
                  Related Reading
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeArticle.relatedIds.map((rid) => {
                    const rel = allArticles.find((a) => a.id === rid);
                    if (!rel) return null;
                    return (
                      <button
                        key={rid}
                        type="button"
                        onClick={() => setActiveArticle(rel)}
                        className="rounded-lg border border-[#D7DDD6] px-3 py-1.5 text-xs font-medium hover:bg-[#EFECE6] dark:border-[#2C3A33]"
                      >
                        {rel.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
