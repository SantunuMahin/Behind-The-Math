import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Filter,
  Shuffle,
  Award,
  Zap,
  BookOpen,
  Sparkles,
  ArrowRight,
  Flame,
  Search
} from 'lucide-react';
import { practiceApi } from '../api/formulasApi';
import ScoreCard from '../components/practice/ScoreCard';
import PracticeCard from '../components/practice/PracticeCard';
import RapidFireQuiz from '../components/practice/RapidFireQuiz';

export default function PracticePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [mode, setMode] = useState('self-paced'); // 'self-paced' | 'challenge'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const data = await practiceApi.getQuestions({ topic: selectedTopic });
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedTopic]);

  const topics = [
    { id: 'all', label: 'All Topics', icon: '✨' },
    { id: 'geometry', label: 'Geometry', icon: '📐' },
    { id: 'algebra', label: 'Algebra', icon: '🧮' },
    { id: 'linalg', label: 'Linear Algebra', icon: '🔲' },
    { id: 'foundations', label: 'Foundations', icon: '🏛️' },
    { id: 'probability', label: 'Probability', icon: '🎲' },
    { id: 'calculus', label: 'Calculus', icon: '∫' },
    { id: 'cse', label: 'Computer Science', icon: '💻' },
  ];

  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.question_text?.toLowerCase().includes(query) ||
      q.subject_name?.toLowerCase().includes(query) ||
      q.topic_tag?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      
      {/* 1. Header & Mode Switcher */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Interactive Practice & Testing Engine</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight">
            Check Your Understanding
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Derive mathematical intuition through deliberate practice. Inline KaTeX proofs, scratchpad whiteboard, and immediate formula verification.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            onClick={() => setMode('self-paced')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'self-paced'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Self-Paced Practice</span>
          </button>

          <button
            onClick={() => setMode('challenge')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'challenge'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ Speed Challenge</span>
          </button>
        </div>
      </div>

      {mode === 'challenge' ? (
        <RapidFireQuiz questions={questions} />
      ) : (
        <>
          {/* 2. Interactive Score & Tier Dashboard */}
          <ScoreCard totalQuestions={questions.length} currentTopic={selectedTopic} />

          {/* 3. Search & Topic Navigation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Filter by Discipline
              </span>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or formulas…"
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTopic === t.id
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs scale-[1.02]'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Questions List */}
          <div className="space-y-6">
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-zinc-500">Loading problem set with mathematical proofs...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-2">
                <div className="text-2xl">🔍</div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">No questions found</h3>
                <p className="text-xs text-zinc-500">
                  Try clearing your search query or choosing another discipline.
                </p>
                <button
                  onClick={() => {
                    setSelectedTopic('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-bold text-black dark:text-white underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredQuestions.map((q) => (
                <PracticeCard key={q.id} question={q} />
              ))
            )}
          </div>
        </>
      )}

    </div>
  );
}
