import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Trash2 } from 'lucide-react';
import { LapTime } from '../types';
import { formatStopwatchMs } from '../utils/timeFormat';
import { vibrationService } from '../services/vibrationService';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

export const StopwatchTab: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<LapTime[]>(() => storageService.getStopwatchLaps());

  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    storageService.saveStopwatchLaps(laps);
  }, [laps]);

  const tick = () => {
    const now = performance.now();
    const currentElapsed = accumulatedMsRef.current + (now - startTimeRef.current);
    setElapsedMs(currentElapsed);
    animFrameRef.current = requestAnimationFrame(tick);
  };

  const handleStart = () => {
    vibrationService.tap();
    audioService.playClick();
    startTimeRef.current = performance.now();
    setIsRunning(true);
    animFrameRef.current = requestAnimationFrame(tick);
  };

  const handlePause = () => {
    vibrationService.tap();
    audioService.playClick();
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    accumulatedMsRef.current += performance.now() - startTimeRef.current;
    setElapsedMs(accumulatedMsRef.current);
    setIsRunning(false);
  };

  const handleReset = () => {
    vibrationService.tap();
    audioService.playClick();
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsRunning(false);
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    vibrationService.tap();
    audioService.playClick();
    const currentTotal = isRunning
      ? accumulatedMsRef.current + (performance.now() - startTimeRef.current)
      : elapsedMs;

    const previousLapsTotal = laps.reduce((acc, lap) => acc + lap.deltaMs, 0);
    const lapDelta = Math.max(0, currentTotal - previousLapsTotal);

    const newLap: LapTime = {
      lapNumber: laps.length + 1,
      timeMs: currentTotal,
      deltaMs: lapDelta,
    };

    setLaps([newLap, ...laps]); // Newest lap on top
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const formatted = formatStopwatchMs(elapsedMs);

  // Identify fastest and slowest lap (only when >= 2 laps)
  let minDelta = Infinity;
  let maxDelta = -Infinity;
  if (laps.length >= 2) {
    laps.forEach((l) => {
      if (l.deltaMs < minDelta) minDelta = l.deltaMs;
      if (l.deltaMs > maxDelta) maxDelta = l.deltaMs;
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      {/* Main Stopwatch Card (Google Style) */}
      <div className="w-full bg-white dark:bg-[#303134] rounded-2xl sm:rounded-3xl border border-[#dadce0] dark:border-[#3c4043] shadow-xs sm:shadow-md p-6 sm:p-10 flex flex-col items-center justify-between min-h-[380px] sm:min-h-[420px] transition-colors relative overflow-hidden">
        
        {/* Top Header Label */}
        <div className="w-full flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Stopwatch</span>
          {laps.length > 0 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {laps.length} {laps.length === 1 ? 'Lap' : 'Laps'}
            </span>
          )}
        </div>

        {/* Big Centered Digital Display */}
        <div className="my-auto flex flex-col items-center">
          <div className="flex items-baseline font-sans tabular-nums select-none tracking-tight text-[#202124] dark:text-gray-100 py-1">
            <span className="text-6xl sm:text-8xl font-normal">
              {formatted.minutes}:{formatted.seconds}
            </span>
            <span className="text-3xl sm:text-5xl font-light text-gray-500 dark:text-gray-400 ml-1 sm:ml-2">
              .{formatted.centiseconds}
            </span>
          </div>

          {/* Underline indicator */}
          <div
            className={`w-32 sm:w-44 h-0.5 rounded-full transition-all duration-200 ${
              !isRunning ? 'bg-[#1a73e8] dark:bg-[#8ab4f8]' : 'bg-transparent'
            }`}
          />
        </div>

        {/* Action Controls Bar */}
        <div className="w-full flex items-center gap-3 mt-6">
          {/* Reset button (visible when not zero) */}
          {elapsedMs > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center justify-center p-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors shrink-0"
              title="Reset Stopwatch"
              aria-label="Reset Stopwatch"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Lap button (visible when running or paused with elapsed > 0) */}
          {elapsedMs > 0 && (
            <button
              onClick={handleLap}
              className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors shrink-0"
              title="Record Lap"
              aria-label="Record Lap"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Lap</span>
            </button>
          )}

          {/* Main Primary Start / Pause Pill Button */}
          <button
            onClick={isRunning ? handlePause : handleStart}
            className={`flex-1 py-3.5 sm:py-4 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-[0.99] ${
              isRunning
                ? 'bg-[#1557b0] dark:bg-[#1a73e8] hover:bg-[#124b99]'
                : 'bg-[#1a73e8] dark:bg-[#8ab4f8] dark:text-gray-900 hover:bg-[#1557b0]'
            }`}
            aria-label={isRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
          >
            {isRunning ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Lap Times Card (if laps recorded) */}
      {laps.length > 0 && (
        <div className="w-full bg-white dark:bg-[#303134] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Lap Times</h4>
            <button
              onClick={() => {
                vibrationService.tap();
                setLaps([]);
              }}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Laps</span>
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 pr-1">
            {laps.map((lap) => {
              const lapDeltaFmt = formatStopwatchMs(lap.deltaMs);
              const lapTotalFmt = formatStopwatchMs(lap.timeMs);

              const isFastest = laps.length >= 2 && lap.deltaMs === minDelta;
              const isSlowest = laps.length >= 2 && lap.deltaMs === maxDelta;

              return (
                <div
                  key={lap.lapNumber}
                  className="flex items-center justify-between py-2.5 px-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-gray-400 w-8">
                      #{lap.lapNumber.toString().padStart(2, '0')}
                    </span>
                    {isFastest && (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-sm">
                        Fastest
                      </span>
                    )}
                    {isSlowest && (
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-sm">
                        Slowest
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Lap duration */}
                    <span
                      className={`font-mono text-sm font-medium tabular-nums ${
                        isFastest
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isSlowest
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      +{lapDeltaFmt.formatted}
                    </span>

                    {/* Overall split time */}
                    <span className="font-mono text-xs text-gray-400 tabular-nums w-16 text-right">
                      {lapTotalFmt.formatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

