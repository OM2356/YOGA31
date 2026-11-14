import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { DEEP_DIVE_PROGRAMS, DeepDiveProgram } from '../data/wellnessData';
import { useAuth } from '../context/AuthContext';
import { ResilientImage } from '../components/ResilientImage';

export const DeepDivePage: React.FC = () => {
  const { user, progress, updateProgressFields } = useAuth();
  const [activeProgram, setActiveProgram] = useState<DeepDiveProgram>(DEEP_DIVE_PROGRAMS[0]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<string>('');

  const completedLessons = progress?.completedLessons || [];
  const quizScores = progress?.quizScores || {};

  const toggleLesson = async (lessonId: string) => {
    if (!user) return;
    const next = completedLessons.includes(lessonId)
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId];
    await updateProgressFields({ completedLessons: next });
  };

  const submitQuiz = async () => {
    const total = activeProgram.quiz.length;
    let correct = 0;
    activeProgram.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct += 1;
    });
    const pct = Math.round((correct / total) * 100);
    setQuizFeedback(`You answered ${correct} of ${total} questions accurately (${pct}%).`);
    if (user) {
      await updateProgressFields({
        quizScores: {
          ...quizScores,
          [activeProgram.id]: pct,
        },
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Program List */}
      <aside className="space-y-2 lg:col-span-4">
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-5 dark:border-[#24322B] dark:bg-[#16201B]">
          <h2 className="font-display text-xl font-semibold">Deep Dive Programs</h2>
          <p className="mt-1 text-xs text-[#5B6860] dark:text-[#98A79E]">
            Structured courses with lessons, practice tips, and comprehension checks.
          </p>
          <div className="mt-4 space-y-2">
            {DEEP_DIVE_PROGRAMS.map((prog) => {
              const doneCount = prog.lessons.filter((l) => completedLessons.includes(l.id)).length;
              const isSelected = prog.id === activeProgram.id;
              return (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => {
                    setActiveProgram(prog);
                    setSelectedAnswers({});
                    setQuizFeedback('');
                  }}
                  className={`w-full rounded-lg border p-3.5 text-left transition ${
                    isSelected
                      ? 'border-[#2F5D46] bg-[#F4F8F5] dark:border-[#84B89B] dark:bg-[#1A2921]'
                      : 'border-[#E2E6DF] hover:border-[#2F5D46]/40 dark:border-[#24322B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#5B6860] dark:text-[#98A79E]">
                    <span>{prog.category}</span>
                    <span className="font-mono tabular-nums">
                      {doneCount}/{prog.lessons.length} lessons
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{prog.title}</p>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Selected Program Content */}
      <section className="space-y-6 lg:col-span-8">
        <div className="overflow-hidden rounded-xl border border-[#E2E6DF] bg-white dark:border-[#24322B] dark:bg-[#16201B]">
          <div className="aspect-[16/7] overflow-hidden bg-[#EFECE6] dark:bg-[#1B2720]">
            <ResilientImage
              src={activeProgram.image}
              alt={activeProgram.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6">
            <p className="text-xs text-[#5B6860] dark:text-[#98A79E]">
              {activeProgram.category}
              {quizScores[activeProgram.id] !== undefined && (
                <span> · Best Quiz Score: {quizScores[activeProgram.id]}%</span>
              )}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold">
              {activeProgram.title}
            </h3>
            <p className="mt-2 text-sm text-[#526058] dark:text-[#A9B6AE]">
              {activeProgram.description}
            </p>

            <div className="mt-5 border-t border-[#E2E6DF] pt-4 dark:border-[#24322B]">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#5B6860] dark:text-[#98A79E]">
                Learning Objectives
              </h4>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#35423B] dark:text-[#C0CDC5]">
                {activeProgram.objectives.map((obj) => (
                  <li key={obj}>{obj}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          {activeProgram.lessons.map((lesson, idx) => {
            const done = completedLessons.includes(lesson.id);
            return (
              <article
                key={lesson.id}
                className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-[#5B6860] dark:text-[#98A79E]">
                      Lesson 0{idx + 1} · {lesson.durationMinutes} min read
                    </p>
                    <h4 className="mt-1 text-lg font-semibold">{lesson.title}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLesson(lesson.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      done
                        ? 'bg-[#2F5D46] text-white'
                        : 'border border-[#D7DDD6] text-[#18221D] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:text-[#EEF2EE]'
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    <span>{done ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#425049] dark:text-[#B8C4BC]">
                  {lesson.content.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-[#E2E6DF] bg-[#F8F7F4] p-3.5 text-xs text-[#35423B] dark:border-[#2C3A33] dark:bg-[#111915] dark:text-[#C0CDC5]">
                  <strong>Practice Application:</strong> {lesson.practiceTip}
                </div>
              </article>
            );
          })}
        </div>

        {/* Knowledge Quiz */}
        <div className="rounded-xl border border-[#E2E6DF] bg-white p-6 dark:border-[#24322B] dark:bg-[#16201B]">
          <h4 className="font-display text-lg font-semibold">Knowledge Check</h4>
          <div className="mt-4 space-y-5">
            {activeProgram.quiz.map((q, qIdx) => (
              <div key={q.question} className="space-y-2">
                <p className="text-sm font-medium">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oIdx) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#E2E6DF] px-3 py-2 text-xs hover:bg-[#F8F7F4] dark:border-[#24322B] dark:hover:bg-[#1A2620]"
                    >
                      <input
                        type="radio"
                        name={`quiz-${activeProgram.id}-${qIdx}`}
                        checked={selectedAnswers[qIdx] === oIdx}
                        onChange={() =>
                          setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                        }
                        className="accent-[#2F5D46]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {quizFeedback && (
                  <p className="text-xs text-[#2F5D46] dark:text-[#84B89B]">
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={submitQuiz}
              className="rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white hover:bg-[#264C39]"
            >
              Check Answers
            </button>
            {quizFeedback && (
              <span className="text-xs font-medium text-[#18221D] dark:text-[#EEF2EE]">
                {quizFeedback}
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
