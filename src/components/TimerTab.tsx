import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Edit3, Volume2 } from 'lucide-react';
import { TimerItem, SoundType } from '../types';
import { formatSeconds } from '../utils/timeFormat';
import { TimeInputModal } from './TimeInputModal';
import { vibrationService } from '../services/vibrationService';
import { audioService } from '../services/audioService';

interface TimerTabProps {
  timers: TimerItem[];
  activeTimerId: string;
  setActiveTimerId: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onAddSeconds: (id: string, seconds: number) => void;
  onCreateTimer: (label: string, totalSeconds: number, sound: SoundType) => void;
  onUpdateTimer: (id: string, label: string, totalSeconds: number, sound: SoundType) => void;
  onDeleteTimer: (id: string) => void;
}

export const TimerTab: React.FC<TimerTabProps> = ({
  timers,
  activeTimerId,
  setActiveTimerId,
  onToggleTimer,
  onResetTimer,
  onAddSeconds,
  onCreateTimer,
  onUpdateTimer,
  onDeleteTimer,
}) => {
  const [isEditingMain, setIsEditingMain] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const activeTimer = timers.find((t) => t.id === activeTimerId) || timers[0];

  const handlePlayPause = () => {
    if (!activeTimer) return;
    vibrationService.tap();
    audioService.playClick();
    onToggleTimer(activeTimer.id);
  };

  const handleReset = () => {
    if (!activeTimer) return;
    vibrationService.tap();
    audioService.playClick();
    onResetTimer(activeTimer.id);
  };

  const handleAddQuickTime = (seconds: number) => {
    if (!activeTimer) return;
    vibrationService.tap();
    audioService.playClick();
    onAddSeconds(activeTimer.id, seconds);
  };

  const formatted = activeTimer ? formatSeconds(activeTimer.remainingSeconds) : { display: '0:00' };

  // Calculate percentage remaining for the progress ring / line
  const progressPercent = activeTimer && activeTimer.totalSeconds > 0
    ? Math.max(0, Math.min(100, (activeTimer.remainingSeconds / activeTimer.totalSeconds) * 100))
    : 100;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      {/* Main Google-Style Timer Card (matches screenshot) */}
      <div className="w-full bg-white dark:bg-[#303134] rounded-2xl sm:rounded-3xl border border-[#dadce0] dark:border-[#3c4043] shadow-xs sm:shadow-md p-6 sm:p-10 flex flex-col items-center justify-between min-h-[380px] sm:min-h-[420px] transition-colors relative overflow-hidden">
        
        {/* Subtle top progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-[#1a73e8] dark:bg-[#8ab4f8] transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timer Label Badge */}
        <div className="w-full flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{activeTimer?.label || 'Timer'}</span>
            <span className="text-gray-400 dark:text-gray-500">• {activeTimer?.sound.toUpperCase()}</span>
          </div>
          <button
            onClick={() => setIsEditingMain(true)}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded-md"
            title="Edit duration or label"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Big Digital Display (Google style) */}
        <div className="my-auto flex flex-col items-center">
          <button
            onClick={() => {
              if (!activeTimer?.isRunning) {
                setIsEditingMain(true);
              }
            }}
            className="group relative flex flex-col items-center focus:outline-hidden"
            title={activeTimer?.isRunning ? undefined : 'Click to change time'}
          >
            <div className="text-7xl sm:text-8xl font-normal tracking-tight text-[#202124] dark:text-gray-100 font-sans select-none tabular-nums py-1">
              {formatted.display}
            </div>
            
            {/* Blue underline matching Google UI when idle/not running */}
            <div
              className={`w-28 sm:w-36 h-0.5 rounded-full transition-all duration-200 ${
                !activeTimer?.isRunning
                  ? 'bg-[#1a73e8] dark:bg-[#8ab4f8] group-hover:h-1'
                  : 'bg-transparent'
              }`}
            />
          </button>

          {/* Quick Add Chips: +0:30, +1:00, +5:00 */}
          <div className="flex items-center gap-2.5 sm:gap-3 mt-6 sm:mt-8">
            <button
              onClick={() => handleAddQuickTime(30)}
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#004a77] dark:text-[#c2e7ff] hover:bg-[#d2e3fc] dark:hover:bg-[#005a92] active:scale-95 transition-all shadow-xs"
            >
              +0:30
            </button>
            <button
              onClick={() => handleAddQuickTime(60)}
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#004a77] dark:text-[#c2e7ff] hover:bg-[#d2e3fc] dark:hover:bg-[#005a92] active:scale-95 transition-all shadow-xs"
            >
              +1:00
            </button>
            <button
              onClick={() => handleAddQuickTime(300)}
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#004a77] dark:text-[#c2e7ff] hover:bg-[#d2e3fc] dark:hover:bg-[#005a92] active:scale-95 transition-all shadow-xs"
            >
              +5:00
            </button>
          </div>
        </div>

        {/* Bottom Action Bar: Full-width blue pill button (Google style) */}
        <div className="w-full flex items-center gap-3 mt-6">
          {/* Reset button (visible when running, paused, or time has changed) */}
          {(activeTimer?.isRunning || activeTimer?.remainingSeconds !== activeTimer?.totalSeconds) && (
            <button
              onClick={handleReset}
              className="flex items-center justify-center p-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors shrink-0"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Main Primary Blue Pill Button */}
          <button
            onClick={handlePlayPause}
            className={`flex-1 py-3.5 sm:py-4 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-[0.99] ${
              activeTimer?.isRunning
                ? 'bg-[#1557b0] dark:bg-[#1a73e8] hover:bg-[#124b99]'
                : 'bg-[#1a73e8] dark:bg-[#8ab4f8] dark:text-gray-900 hover:bg-[#1557b0]'
            }`}
            aria-label={activeTimer?.isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {activeTimer?.isRunning ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Multiple Concurrent Timers Section */}
      <div className="w-full bg-white dark:bg-[#303134] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">All Timers</h4>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
              {timers.length}
            </span>
          </div>

          <button
            onClick={() => setIsCreatingNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Timer</span>
          </button>
        </div>

        {/* Timers List */}
        <div className="space-y-2.5">
          {timers.map((t) => {
            const isSelected = t.id === activeTimerId;
            const tFormatted = formatSeconds(t.remainingSeconds);
            const tPercent = t.totalSeconds > 0 ? (t.remainingSeconds / t.totalSeconds) * 100 : 100;

            return (
              <div
                key={t.id}
                onClick={() => {
                  vibrationService.tap();
                  setActiveTimerId(t.id);
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                    : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                }`}
              >
                {/* Left: Info & Progress */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mini Circular / Pie progress indicator */}
                  <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={t.isRunning ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}
                        strokeDasharray={`${tPercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {t.label}
                      </p>
                      {isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded-sm">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Volume2 className="w-3 h-3" />
                      <span>{t.sound}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Time & Mini Controls */}
                <div className="flex items-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                  <span className="text-lg font-mono font-medium text-gray-800 dark:text-gray-200 tabular-nums">
                    {tFormatted.display}
                  </span>

                  {/* Play/Pause */}
                  <button
                    onClick={() => {
                      vibrationService.tap();
                      onToggleTimer(t.id);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      t.isRunning
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                    }`}
                    title={t.isRunning ? 'Pause' : 'Start'}
                  >
                    {t.isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  {/* Reset */}
                  <button
                    onClick={() => {
                      vibrationService.tap();
                      onResetTimer(t.id);
                    }}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete (if more than 1 timer) */}
                  {timers.length > 1 && (
                    <button
                      onClick={() => {
                        vibrationService.tap();
                        onDeleteTimer(t.id);
                      }}
                      className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Timer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Main Timer Modal */}
      {isEditingMain && activeTimer && (
        <TimeInputModal
          isOpen={isEditingMain}
          onClose={() => setIsEditingMain(false)}
          title="Edit Timer"
          initialLabel={activeTimer.label}
          initialSeconds={activeTimer.totalSeconds}
          initialSound={activeTimer.sound}
          onSave={(newLabel, newSeconds, newSound) => {
            onUpdateTimer(activeTimer.id, newLabel, newSeconds, newSound);
          }}
        />
      )}

      {/* Create New Timer Modal */}
      {isCreatingNew && (
        <TimeInputModal
          isOpen={isCreatingNew}
          onClose={() => setIsCreatingNew(false)}
          title="Create New Timer"
          initialLabel={`Timer ${timers.length + 1}`}
          initialSeconds={300}
          initialSound="beep"
          onSave={(newLabel, newSeconds, newSound) => {
            onCreateTimer(newLabel, newSeconds, newSound);
          }}
        />
      )}
    </div>
  );
};

