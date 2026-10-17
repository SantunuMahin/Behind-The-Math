import React, { useState, useEffect, useRef } from 'react';
import { Timer, Flame, Award, RotateCcw, Zap, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import MathView from '../common/MathView';
import { useStudent } from '../../context/StudentContext';

export default function RapidFireQuiz({ questions = [] }) {
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'finished'
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'

  const timerRef = useRef(null);

  const startQuiz = (duration = selectedDuration) => {
    setSelectedDuration(duration);
    setTimeLeft(duration);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFeedback(null);
    setUserAnswer('');
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const { awardXp } = useStudent();

  const finishQuiz = () => {
    setGameState('finished');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (score > 0) {
      awardXp(Math.max(25, Math.floor(score / 30)), 'Rapid-Fire Speed Challenge! 🏆');
    }
  };

  const currentQ = questions[currentIndex % Math.max(1, questions.length)];

  const checkAnswer = (ans) => {
    if (!currentQ || feedback) return;
    const cleanUser = ans.trim().toLowerCase();
    const cleanCorrect = currentQ.correct_answer.trim().toLowerCase();

    const isNumCorrect = !isNaN(parseFloat(cleanUser)) &&
      !isNaN(parseFloat(cleanCorrect)) &&
      Math.abs(parseFloat(cleanUser) - parseFloat(cleanCorrect)) <= 0.05 * Math.abs(parseFloat(cleanCorrect) || 1);

    const isMatch = cleanUser === cleanCorrect || isNumCorrect;

    if (isMatch) {
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      const points = 100 * Math.min(4, Math.floor(newStreak / 2) + 1);
      setScore((s) => s + points);
    } else {
      setFeedback('incorrect');
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      setCurrentIndex((i) => (i + 1) % questions.length);
    }, 600);
  };

  if (gameState === 'idle') {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-black dark:bg-zinc-950 text-white border border-zinc-800 shadow-xl text-center space-y-5">
        <div className="inline-flex p-3 rounded-2xl bg-zinc-800 text-zinc-100 border border-zinc-700">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl">
            Rapid-Fire Math Speed Challenge
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Test your formula recall, arithmetic speed, and algebraic reflexes against the clock. Build streaks to earn score multipliers!
          </p>
        </div>

        {/* Timer selection pills */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[
            { sec: 45, label: 'Sprint (45s)' },
            { sec: 60, label: 'Classic (60s)' },
            { sec: 90, label: 'Endurance (90s)' },
          ].map((mode) => (
            <button
              key={mode.sec}
              onClick={() => setSelectedDuration(mode.sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDuration === mode.sec
                  ? 'bg-white text-black font-bold shadow-md scale-105'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={() => startQuiz(selectedDuration)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg hover:opacity-95 transition-all inline-flex items-center gap-2"
          >
            <Timer className="w-4 h-4" />
            <span>Start Challenge Now</span>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="text-4xl">🏆</div>
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            Challenge Completed!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Great performance! Here is your speed recall summary:
          </p>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Final Score
            </span>
            <span className="font-mono font-extrabold text-xl text-emerald-600 dark:text-emerald-400">
              {score}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Max Streak
            </span>
            <span className="font-mono font-extrabold text-xl text-amber-500">
              {maxStreak} 🔥
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091122] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Questions
            </span>
            <span className="font-mono font-extrabold text-xl text-blue-600 dark:text-blue-400">
              {currentIndex}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => startQuiz(selectedDuration)}
            className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          <button
            onClick={() => setGameState('idle')}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Exit to Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#121D33] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Quiz Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        {/* Timer */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg font-mono font-bold text-sm flex items-center gap-1.5 ${
            timeLeft <= 10
              ? 'bg-red-100 dark:bg-red-950 text-red-600 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
          }`}>
            <Timer className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
          <span className="text-xs text-slate-400">Q#{currentIndex + 1}</span>
        </div>

        {/* Streak & Score */}
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs font-bold animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak}x Streak!</span>
            </div>
          )}

          <div className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
            {score} pts
          </div>
        </div>
      </div>

      {/* Active Question Box */}
      {currentQ && (
        <div className={`space-y-4 p-5 rounded-2xl border transition-all ${
          feedback === 'correct'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
            : feedback === 'incorrect'
            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700'
            : 'bg-slate-50 dark:bg-[#091122] border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-semibold tracking-wider">{currentQ.topic_tag || 'Mathematics'}</span>
            <span className="capitalize">{currentQ.subject?.name || 'General'}</span>
          </div>

          <p className="font-heading font-semibold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question_text}
          </p>

          {/* Options (Multiple choice or Text Input) */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => checkAnswer(opt)}
                  disabled={feedback !== null}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121D33] hover:border-[#457B9D] dark:hover:border-[#A8DADC] text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium text-left transition-all active:scale-[0.98]"
                >
                  <span className="inline-block w-6 font-bold text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                checkAnswer(userAnswer);
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type numerical answer..."
                autoFocus
                disabled={feedback !== null}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              <button
                type="submit"
                disabled={!userAnswer.trim() || feedback !== null}
                className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
