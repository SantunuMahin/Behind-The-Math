import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Lightbulb,
  Check,
  X,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Edit3,
  Trash2,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { practiceApi } from '../../api/formulasApi';
import { useStudent } from '../../context/StudentContext';
import InlineMath from '../common/InlineMath';

const MATH_SYMBOLS = [
  { symbol: 'π', latex: '\\pi', label: 'pi' },
  { symbol: '√', latex: '\\sqrt{}', label: 'sqrt' },
  { symbol: '²', latex: '^2', label: 'squared' },
  { symbol: 'θ', latex: '\\theta', label: 'theta' },
  { symbol: '±', latex: '\\pm', label: 'plus minus' },
  { symbol: '≈', latex: '\\approx', label: 'approx' },
  { symbol: '·', latex: '\\cdot', label: 'times' },
  { symbol: '/', latex: '/', label: 'divide' },
  { symbol: '^', latex: '^', label: 'power' },
  { symbol: '∞', latex: '\\infty', label: 'infinity' },
];

export default function PracticeCard({ question }) {
  const { recordAnswer, awardXp } = useStudent();
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Scratchpad Canvas Refs
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [scratchColor, setScratchColor] = useState('pen'); // 'pen' | 'eraser'
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!userAnswer || !userAnswer.trim() || loading) return;

    setLoading(true);
    try {
      const res = await practiceApi.submitAnswer(question.id, userAnswer);
      setFeedback(res);

      if (!alreadyAnswered) {
        recordAnswer(res.is_correct);
        setAlreadyAnswered(true);

        if (res.is_correct) {
          awardXp(20, `Solved Question #${question.order || question.id}! 🎯`);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setUserAnswer('');
    setFeedback(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const insertSymbol = (sym) => {
    setUserAnswer((prev) => prev + sym);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Scratchpad drawing logic
  useEffect(() => {
    if (!isScratchpadOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = canvas.parentElement.clientWidth || 600;
    canvas.height = 180;

    // Draw subtle grid
    ctx.strokeStyle = '#88888815';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [isScratchpadOpen]);

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = scratchColor === 'eraser' ? 16 : 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = scratchColor === 'eraser' ? '#ffffff' : '#000000';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw grid
    ctx.strokeStyle = '#88888815';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const getSubjectIcon = (name = '') => {
    const s = name.toLowerCase();
    if (s.includes('geom')) return '📐';
    if (s.includes('algeb')) return '🧮';
    if (s.includes('calc')) return '∫';
    if (s.includes('prob')) return '🎲';
    if (s.includes('linear')) return '🔲';
    if (s.includes('comp') || s.includes('cse')) return '💻';
    return '🔬';
  };

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-xs space-y-5 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 relative">
      
      {/* 1. Question Meta Ribbon */}
      <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-100 dark:border-zinc-850/80 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold text-[11px] tracking-wide">
            QUESTION #{question.order || question.id}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] capitalize">
            <span>{getSubjectIcon(question.subject_name || question.topic_tag)}</span>
            <span>{question.subject_name || question.topic_tag}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {question.unit_label && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
              Units: {question.unit_label}
            </span>
          )}
          <span className="text-[11px] text-amber-500 font-bold font-mono">
            +20 XP
          </span>
        </div>
      </div>

      {/* 2. Question Text with Inline Math Parsing */}
      <div className="text-base sm:text-lg font-medium text-zinc-950 dark:text-zinc-100 leading-relaxed">
        <InlineMath text={question.question_text} />
      </div>

      {/* 3. Mathematical Quick Symbol Keypad */}
      {question.question_type !== 'multiple_choice' && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Math Keypad Shortcuts</span>
            <button
              type="button"
              onClick={() => setIsScratchpadOpen((prev) => !prev)}
              className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3 text-amber-500" />
              <span>{isScratchpadOpen ? 'Hide Scratchpad' : 'Open Scratchpad Canvas'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {MATH_SYMBOLS.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => insertSymbol(item.symbol)}
                className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-sm border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title={`Insert ${item.label}`}
              >
                {item.symbol}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUserAnswer('')}
              className="px-2.5 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[11px] font-bold border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer"
              title="Clear answer field"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 4. Interactive Scratchpad Canvas Drawer */}
      {isScratchpadOpen && (
        <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-500" />
              <span>Student Scratchpad (Draw Derivations)</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScratchColor('pen')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  scratchColor === 'pen'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Pen
              </button>
              <button
                type="button"
                onClick={() => setScratchColor('eraser')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  scratchColor === 'eraser'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Eraser
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Clear all drawings"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-crosshair touch-none shadow-inner"
            style={{ height: '180px' }}
          />
        </div>
      )}

      {/* 5. Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {question.question_type === 'multiple_choice' && question.options && question.options.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {question.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = userAnswer === opt;
              return (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer text-xs sm:text-sm transition-all ${
                    isSelected
                      ? 'border-black dark:border-white bg-zinc-950 text-white dark:bg-zinc-900 font-semibold shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    value={opt}
                    checked={isSelected}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {letter}
                  </span>
                  <div className="flex-1">
                    <InlineMath text={opt} />
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type numeric answer or expression…"
                  className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-medium text-zinc-950 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner"
                />
              </div>
              {question.unit_label && (
                <span className="text-xs text-zinc-500 font-mono px-2.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
                  {question.unit_label}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          {question.hint && (
            <button
              type="button"
              onClick={() => setShowHint((h) => !h)}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${showHint ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!userAnswer.trim() || loading}
            className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            {loading ? (
              <span>Evaluating...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Check Answer</span>
              </>
            )}
          </button>

          {feedback && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </form>

      {/* 6. Progressive Formula Hint */}
      {showHint && question.hint && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-950 dark:text-amber-200 animate-in fade-in duration-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <Lightbulb className="w-3.5 h-3.5 fill-amber-500" />
            <span>Mathematical Derivation Hint:</span>
          </div>
          <div className="pl-5 leading-relaxed">
            <InlineMath text={question.hint} />
          </div>
        </div>
      )}

      {/* 7. Answer Feedback & Formula Derivation Explanation */}
      {feedback && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm animate-in fade-in duration-200 space-y-2 ${
            feedback.is_correct
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="font-black flex items-center gap-2">
            {feedback.is_correct ? (
              <>
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-emerald-800 dark:text-emerald-300">
                  {feedback.message || 'Mathematically Correct! +20 XP awarded.'}
                </span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-rose-800 dark:text-rose-300">
                  Not quite right. Correct Answer: <strong className="font-mono">{feedback.correct_answer}</strong>
                </span>
              </>
            )}
          </div>

          {feedback.explanation && (
            <div className="pl-7 text-xs leading-relaxed opacity-95 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <span className="font-bold block text-zinc-700 dark:text-zinc-300 mb-0.5">Step-by-Step Derivation:</span>
              <InlineMath text={feedback.explanation} />
            </div>
          )}
        </div>
      )}

    </div>
  );
}
