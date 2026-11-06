import React, { useState } from 'react';
import { X, Volume2, Check } from 'lucide-react';
import { AlarmItem, SoundType } from '../types';
import { AVAILABLE_SOUNDS, audioService } from '../services/audioService';
import { vibrationService } from '../services/vibrationService';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarm: Omit<AlarmItem, 'id'>) => void;
  initialAlarm?: AlarmItem;
}

const DAYS = [
  { day: 1, label: 'M', full: 'Mon' },
  { day: 2, label: 'T', full: 'Tue' },
  { day: 3, label: 'W', full: 'Wed' },
  { day: 4, label: 'T', full: 'Thu' },
  { day: 5, label: 'F', full: 'Fri' },
  { day: 6, label: 'S', full: 'Sat' },
  { day: 0, label: 'S', full: 'Sun' },
];

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAlarm,
}) => {
  const [time, setTime] = useState<string>(initialAlarm ? initialAlarm.time : '07:00');
  const [label, setLabel] = useState<string>(initialAlarm ? initialAlarm.label : 'Alarm');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialAlarm ? initialAlarm.daysOfWeek : [1, 2, 3, 4, 5]);
  const [sound, setSound] = useState<SoundType>(initialAlarm ? initialAlarm.sound : 'bell');
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(initialAlarm ? initialAlarm.snoozeMinutes : 5);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    vibrationService.tap();
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const handlePreviewSound = (s: SoundType) => {
    vibrationService.tap();
    audioService.previewSound(s);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    vibrationService.success();
    onSave({
      time,
      label: label.trim() || 'Alarm',
      daysOfWeek,
      enabled: true,
      sound,
      snoozeMinutes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#303134] rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {initialAlarm ? 'Edit Alarm' : 'Set New Alarm'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Time Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Alarm Time
            </label>
            <div className="flex justify-center">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="text-4xl font-normal text-center py-2 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#202124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Alarm Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Wake up, Medicine, Daily Standup"
              maxLength={30}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202124] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
            />
          </div>

          {/* Repeat Days Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Repeat Days
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDaysOfWeek([1, 2, 3, 4, 5])}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Weekdays
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setDaysOfWeek([0, 1, 2, 3, 4, 5, 6])}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Every day
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setDaysOfWeek([])}
                  className="text-gray-500 hover:underline"
                >
                  Once
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1">
              {DAYS.map(({ day, label: dayLabel }) => {
                const isSelected = daysOfWeek.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {dayLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Alarm Tone
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

          {/* Snooze duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Snooze Length
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    vibrationService.tap();
                    setSnoozeMinutes(mins);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    snoozeMinutes === mins
                      ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-200'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save Alarm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

