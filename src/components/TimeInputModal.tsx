import React, { useState } from 'react';
import { X, Volume2, Play } from 'lucide-react';
import { SoundType } from '../types';
import { AVAILABLE_SOUNDS, audioService } from '../services/audioService';
import { vibrationService } from '../services/vibrationService';

interface TimeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, totalSeconds: number, sound: SoundType) => void;
  initialLabel?: string;
  initialSeconds?: number;
  initialSound?: SoundType;
  title?: string;
}

export const TimeInputModal: React.FC<TimeInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLabel = 'Timer',
  initialSeconds = 300,
  initialSound = 'beep',
  title = 'Set Timer',
}) => {
  const initH = Math.floor(initialSeconds / 3600);
  const initM = Math.floor((initialSeconds % 3600) / 60);
  const initS = initialSeconds % 60;

  const [hours, setHours] = useState<number>(initH);
  const [minutes, setMinutes] = useState<number>(initM);
  const [seconds, setSeconds] = useState<number>(initS);
  const [label, setLabel] = useState<string>(initialLabel);
  const [sound, setSound] = useState<SoundType>(initialSound);

  if (!isOpen) return null;

  const handlePresetAdd = (addedSeconds: number) => {
    vibrationService.tap();
    const currentTotal = hours * 3600 + minutes * 60 + seconds + addedSeconds;
    setHours(Math.floor(currentTotal / 3600));
    setMinutes(Math.floor((currentTotal % 3600) / 60));
    setSeconds(currentTotal % 60);
  };

  const handlePreviewSound = (s: SoundType) => {
    vibrationService.tap();
    audioService.previewSound(s);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total <= 0) return;
    vibrationService.success();
    onSave(label.trim() || 'Timer', total, sound);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#303134] rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Label Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Timer Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Pasta, Tea, Workout"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202124] text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={30}
            />
          </div>

          {/* Time Picker Inputs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Duration
            </label>
            <div className="flex items-center justify-center gap-2 text-center">
              {/* Hours */}
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={hours || ''}
                  placeholder="00"
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-3xl font-light text-center py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#202124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Hours</span>
              </div>
              <span className="text-2xl font-bold text-gray-400 mb-5">:</span>

              {/* Minutes */}
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes || ''}
                  placeholder="00"
                  onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full text-3xl font-light text-center py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#202124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Minutes</span>
              </div>
              <span className="text-2xl font-bold text-gray-400 mb-5">:</span>

              {/* Seconds */}
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds || ''}
                  placeholder="00"
                  onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full text-3xl font-light text-center py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#202124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Seconds</span>
              </div>
            </div>

            {/* Quick add chips */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => handlePresetAdd(60)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 transition-colors"
              >
                +1 min
              </button>
              <button
                type="button"
                onClick={() => handlePresetAdd(300)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 transition-colors"
              >
                +5 min
              </button>
              <button
                type="button"
                onClick={() => handlePresetAdd(600)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 transition-colors"
              >
                +10 min
              </button>
              <button
                type="button"
                onClick={() => {
                  setHours(0);
                  setMinutes(0);
                  setSeconds(0);
                }}
                className="px-2.5 py-1 rounded-full text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Sound selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Alarm Sound
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SOUNDS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    setSound(s.id);
                    handlePreviewSound(s.id);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    sound === s.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-200 font-semibold'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  <Volume2 className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hours * 3600 + minutes * 60 + seconds <= 0}
              className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Save & Start</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
