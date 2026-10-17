import React, { useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  AlertTriangle,
  X,
  Zap,
  Target,
  Edit3,
  ChevronUp,
  ChevronDown,
  Coffee,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  CheckCircle2,
  Music
} from 'lucide-react';
import { useFocus, SOUNDSCAPES } from '../../context/FocusContext';
import { useStudent } from '../../context/StudentContext';

export default function FocusHUD() {
  const {
    isFocusActive,
    isPaused,
    focusDuration,
    secondsRemaining,
    focusGoal,
    ambientSound,
    ambientVolume,
    updateAmbientVolume,
    tabSwitches,
    pauseFocusSession,
    resumeFocusSession,
    cancelFocusSession,
    toggleAmbientSound,
    isEmergencyExitOpen,
    setIsEmergencyExitOpen,
    isHudMinimized,
    setIsHudMinimized,
    openBreakStudio,
    sessionTasks,
    toggleTask,
    addTask,
    removeTask
  } = useFocus();

  const { setIsScratchpadOpen } = useStudent();
  const [showTasksPopover, setShowTasksPopover] = useState(false);
  const [showAudioPopover, setShowAudioPopover] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');

  if (!isFocusActive) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPct = Math.min(100, Math.max(0, ((focusDuration - secondsRemaining) / focusDuration) * 100));
  const strokeDashoffset = 100 - progressPct;

  const completedTasksCount = sessionTasks.filter((t) => t.completed).length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  };

  const handleAddNewTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addTask(newTaskInput.trim());
    setNewTaskInput('');
  };

  return (
    <>
      {/* 1. Floating Focus HUD Dock (Responsive: Centered Bottom on Mobile, Bottom-Right on Desktop) */}
      <aside
        aria-label="Focus mode controls"
        className={`fixed z-50 animate-in slide-in-from-bottom-4 duration-200 transition-all ${isHudMinimized
            ? 'bottom-3 right-3 sm:bottom-6 sm:right-6'
            : 'bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md'
          }`}
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-xl overflow-hidden transition-all">

          {/* A. Minimized Floating Capsule Mode */}
          {isHudMinimized ? (
            <div className="px-3 py-2 flex items-center gap-2.5">
              {/* Mini ring */}
              <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-white"
                    strokeDasharray="100, 100"
                    strokeDashoffset={strokeDashoffset}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              {/* Time */}
              <span className="font-mono font-extrabold text-xs sm:text-sm text-white tracking-tight">
                {formattedTime}
              </span>

              {isPaused && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                  Paused
                </span>
              )}

              {/* Play / Pause button */}
              {isPaused ? (
                <button
                  type="button"
                  onClick={resumeFocusSession}
                  className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                  title="Resume focus timer"
                  aria-label="Resume timer"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseFocusSession}
                  className="p-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
                  title="Pause focus timer"
                  aria-label="Pause timer"
                >
                  <Pause className="w-3 h-3" />
                </button>
              )}

              {/* Expand button */}
              <button
                type="button"
                onClick={() => setIsHudMinimized(false)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer ml-0.5"
                title="Expand Focus Controls"
                aria-label="Expand Focus Controls"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* B. Full Expanded Control Row */
            <div>
              <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">

                {/* Circular Progress & Timer */}
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-white transition-all duration-1000 ease-linear"
                        strokeDasharray="100, 100"
                        strokeDashoffset={strokeDashoffset}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-[8px] sm:text-[9px] font-bold text-zinc-300 font-mono">
                      {Math.round(progressPct)}%
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-mono font-extrabold text-sm sm:text-base tracking-tight leading-none text-white flex items-center gap-1.5 flex-wrap">
                      <span>{formattedTime}</span>
                      {isPaused && (
                        <span className="text-[8px] sm:text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase animate-pulse">
                          Paused
                        </span>
                      )}
                      {tabSwitches > 0 && (
                        <span
                          title={`You switched tabs ${tabSwitches} times. Stay focused on BehindTheMath!`}
                          className="text-[8px] sm:text-[9px] font-sans px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold"
                        >
                          ⚠️ {tabSwitches} {tabSwitches === 1 ? 'switch' : 'switches'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-medium truncate max-w-[110px] sm:max-w-[170px] mt-0.5">
                      {focusGoal}
                    </div>
                  </div>
                </div>

                {/* Quick Control Actions */}
                <div className="flex items-center gap-1 shrink-0">

                  {/* Play / Pause */}
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={resumeFocusSession}
                      title="Resume focus timer"
                      className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                      aria-label="Resume timer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseFocusSession}
                      title="Pause focus timer"
                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                      aria-label="Pause timer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Micro-Tasks Checklist Popover Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowTasksPopover((p) => !p);
                      setShowAudioPopover(false);
                    }}
                    title="Micro-Task Milestones"
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center gap-1 text-[11px] font-mono ${
                      showTasksPopover
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                    aria-label="Toggle task checklist"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">{completedTasksCount}/{sessionTasks.length}</span>
                  </button>

                  {/* Sound Toggle & Popover */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAudioPopover((p) => !p);
                      setShowTasksPopover(false);
                    }}
                    title={`Ambient Audio: ${ambientSound === 'off' ? 'Muted' : 'Playing'} (Tap for audio settings)`}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ${
                      ambientSound !== 'off'
                        ? 'bg-zinc-800 text-white ring-1 ring-zinc-700'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                    }`}
                    aria-label="Ambient sound settings"
                  >
                    {ambientSound !== 'off' ? (
                      <Volume2 className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Mindful Break Trigger */}
                  <button
                    type="button"
                    onClick={() => openBreakStudio({ durationMinutes: 5 })}
                    title="Take Mindful Break (5m or 10m breathing & audio)"
                    className="p-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label="Take Mindful Break"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                  </button>

                  {/* Math Scratchpad Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsScratchpadOpen(true)}
                    title="Open Scratchpad Whiteboard without breaking focus"
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label="Open Scratchpad"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Fullscreen Toggle (Desktop only) */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen Zen Mode"
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer hidden sm:inline-flex min-w-[32px] min-h-[32px] items-center justify-center"
                    aria-label="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Minimize to compact pill */}
                  <button
                    type="button"
                    onClick={() => setIsHudMinimized(true)}
                    title="Minimize to compact floating capsule"
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label="Minimize HUD"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Emergency Exit Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsEmergencyExitOpen(true)}
                    title="Early Exit Focus Mode"
                    className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ml-0.5"
                    aria-label="Break Focus Session"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Tasks Checklist Popover Drawer */}
              {showTasksPopover && (
                <div className="p-3 border-t border-zinc-800 bg-zinc-900/90 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-zinc-400 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Session Milestones ({completedTasksCount}/{sessionTasks.length})</span>
                    </span>
                    <button
                      onClick={() => setShowTasksPopover(false)}
                      className="text-zinc-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin pr-1">
                    {sessionTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {task.completed ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          )}
                          <span className={`truncate text-[11px] ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                            {task.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTask(task.id);
                          }}
                          className="text-zinc-500 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Task Input */}
                  <form onSubmit={handleAddNewTask} className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Add micro-task..."
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                    <button
                      type="submit"
                      disabled={!newTaskInput.trim()}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-black font-bold text-xs disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* Soundscapes Selector Popover */}
              {showAudioPopover && (
                <div className="p-3 border-t border-zinc-800 bg-zinc-900/90 text-xs space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-zinc-400 font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5 text-white">
                      <Music className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Synthesized Soundscapes</span>
                    </span>
                    <button
                      onClick={() => setShowAudioPopover(false)}
                      className="text-zinc-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {SOUNDSCAPES.map((snd) => (
                      <button
                        key={snd.id}
                        type="button"
                        onClick={() => toggleAmbientSound(snd.id)}
                        className={`p-1.5 rounded-lg text-left text-[11px] font-medium border transition-colors cursor-pointer truncate ${
                          ambientSound === snd.id
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {snd.label}
                      </button>
                    ))}
                  </div>

                  {ambientSound !== 'off' && (
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        <span>Volume</span>
                      </span>
                      <input
                        type="range"
                        min="0.02"
                        max="0.60"
                        step="0.02"
                        value={ambientVolume}
                        onChange={(e) => updateAmbientVolume(Number(e.target.value))}
                        className="w-28 accent-white cursor-pointer h-1"
                        aria-label="Ambient volume"
                      />
                      <span className="font-mono text-zinc-300">{Math.round(ambientVolume * 100)}%</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      </aside>

      {/* 2. Emergency Exit Confirmation Dialog */}
      {isEmergencyExitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Break Focus Session?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {minutes} minutes remaining on: {focusGoal}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800">
              Quitting now will forfeit your accumulated focus time and no bonus Focus XP will be awarded for this session. Are you sure you want to exit?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsEmergencyExitOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs hover:opacity-90 cursor-pointer"
              >
                Keep Studying (Recommended)
              </button>
              <button
                type="button"
                onClick={cancelFocusSession}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold cursor-pointer"
              >
                Forfeit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
