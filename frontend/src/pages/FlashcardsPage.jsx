import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, RotateCcw, Check, Sparkles, ArrowRight, Eye, Shuffle, BookOpen } from 'lucide-react';
import { studentApi, formulasApi } from '../api/formulasApi';
import { useStudent } from '../context/StudentContext';
import { normalizeFormula } from '../utils/formulaUtils';
import MathView from '../components/common/MathView';

export default function FlashcardsPage() {
  const { bookmarks, awardXp } = useStudent();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [activeDeckMode, setActiveDeckMode] = useState('all'); // 'all' | 'bookmarked' | 'calculus' | 'physics'

  const loadFlashcards = async (mode = activeDeckMode) => {
    setLoading(true);
    try {
      // 1. Try to fetch scheduled flashcards from DRF
      const data = await studentApi.getFlashcards();
      if (data && Array.isArray(data) && data.length > 0 && mode === 'all') {
        setCards(data);
        setCurrentIndex(0);
        setIsFlipped(false);
        setCompleted(false);
        setLoading(false);
        return;
      }

      // 2. Dynamic generation from live Django formulas
      const rawFormulas = await formulasApi.getFormulas();
      if (rawFormulas && Array.isArray(rawFormulas) && rawFormulas.length > 0) {
        const normalized = rawFormulas.map(normalizeFormula);
        
        let filtered = normalized;
        if (mode === 'bookmarked') {
          filtered = normalized.filter((f) => bookmarks.has(f.id) || bookmarks.has(f.formula_id) || (f.backend_id && bookmarks.has(f.backend_id)));
        } else if (mode === 'calculus') {
          filtered = normalized.filter((f) => (f.subject_slug || f.subject_name || '').toLowerCase().includes('calculus'));
        } else if (mode === 'physics') {
          filtered = normalized.filter((f) => (f.subject_slug || f.subject_name || '').toLowerCase().includes('physics'));
        }

        if (filtered.length === 0) filtered = normalized;

        // Shuffle and pick 10 formulas
        const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);
        const generatedCards = shuffled.map((f, i) => ({
          id: `seed-${f.id || i}`,
          formula: f.backend_id || f.id,
          formula_detail: f,
          repetitions: 0,
          interval_days: 1,
          ease_factor: 2.5,
          next_due_date: new Date().toISOString(),
        }));

        setCards(generatedCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setCompleted(false);
      }
    } catch (err) {
      console.error('Flashcard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashcards(activeDeckMode);
  }, [activeDeckMode]);

  const currentCard = cards[currentIndex];

  const handleRate = async (quality) => {
    if (!currentCard) return;
    try {
      if (typeof currentCard.id === 'number' || (!String(currentCard.id).startsWith('seed-'))) {
        await studentApi.reviewCard(currentCard.id, quality);
      }
      awardXp(15, 'Flashcard Recall Verified');
    } catch (err) {
      console.warn('Review sync note:', err);
    }

    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
      awardXp(50, 'Flashcard Deck Completed! 🧠');
    }
  };

  const resetDeck = () => {
    loadFlashcards(activeDeckMode);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Active Recall & Spaced Repetition (SM-2)</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-white">
          Formula Flashcard Study Deck
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Test your recall. Flip to verify the mathematical notation and intuition, then schedule your next review interval.
        </p>
      </div>

      {/* Deck Selector Tabs */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {[
          { id: 'all', label: 'All Dynamic Deck' },
          { id: 'bookmarked', label: `My Bookmarks (${bookmarks.size})` },
          { id: 'calculus', label: 'Calculus' },
          { id: 'physics', label: 'Physics' },
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDeckMode(d.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeDeckMode === d.id
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center text-zinc-400">Loading flashcards deck...</div>
      ) : completed ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
          <div className="text-4xl">🎉</div>
          <h3 className="font-heading font-extrabold text-2xl text-zinc-900 dark:text-white">
            Study Session Complete!
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            You reviewed all {cards.length} formulas in this deck. Your spaced-repetition memory intervals have been updated.
          </p>
          <button
            onClick={resetDeck}
            className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            Review Deck Again
          </button>
        </div>
      ) : currentCard ? (
        <div className="space-y-6">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}% Complete</span>
          </div>

          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-black dark:bg-white h-full transition-all duration-200"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* Flashcard Box with Flip */}
          <div
            onClick={() => setIsFlipped((f) => !f)}
            className="min-h-[320px] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg cursor-pointer hover:border-black dark:hover:border-white transition-all flex flex-col justify-between select-none"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  {currentCard.formula_detail?.subject_name}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Click anywhere to flip</span>
                </span>
              </div>

              <h3 className="font-heading font-extrabold text-2xl text-zinc-900 dark:text-white">
                {currentCard.formula_detail?.title}
              </h3>
            </div>

            {/* Front vs Back Content */}
            {!isFlipped ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Can you mentally write or state the exact formula and variables?
                </p>
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 pt-2">
                  (Click card to reveal answer)
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 font-mono text-base">
                  <MathView math={currentCard.formula_detail?.formula_latex} display={true} />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                  {currentCard.formula_detail?.summary}
                </p>
              </div>
            )}

            <div className="text-center text-[11px] text-zinc-400">
              Ease Factor: {currentCard.ease_factor} · Repetitions: {currentCard.repetitions}
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped && (
            <div className="grid grid-cols-4 gap-2 pt-2 animate-in fade-in duration-150">
              <button
                onClick={() => handleRate(1)}
                className="py-3 px-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 text-xs font-semibold"
              >
                Again (1d)
              </button>
              <button
                onClick={() => handleRate(2)}
                className="py-3 px-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 text-xs font-semibold"
              >
                Hard (2d)
              </button>
              <button
                onClick={() => handleRate(3)}
                className="py-3 px-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold"
              >
                Good (4d)
              </button>
              <button
                onClick={() => handleRate(4)}
                className="py-3 px-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-semibold"
              >
                Easy (7d)
              </button>
            </div>
          )}

        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
          <div className="text-4xl">📚</div>
          <h3 className="font-heading font-extrabold text-2xl text-zinc-900 dark:text-white">
            No Flashcards Due Right Now
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            You're all caught up on scheduled reviews! Browse the formula library to bookmark new formulas and build your spaced repetition deck.
          </p>
          <div className="pt-2">
            <Link
              to="/library"
              className="inline-block px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              Explore Formula Library
            </Link>
          </div>
        </div>
      )}


    </div>
  );
}
