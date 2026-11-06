import React, { useEffect } from 'react';
import { Bell, Check, Clock, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RingingEvent } from '../types';
import { audioService } from '../services/audioService';
import { vibrationService } from '../services/vibrationService';

interface RingingModalProps {
  event: RingingEvent | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const RingingModal: React.FC<RingingModalProps> = ({
  event,
  onDismiss,
  onSnooze,
}) => {
  useEffect(() => {
    if (!event) return;

    // Start sound and vibration
    audioService.startRinging(event.sound);
    vibrationService.startAlarmVibration();

    // Fire joyful confetti if it's a timer completed
    if (event.source === 'timer') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored
      }
    }

    return () => {
      audioService.stopRinging();
      vibrationService.stopAlarmVibration();
    };
  }, [event]);

  if (!event) return null;

  const handleDismiss = () => {
    audioService.stopRinging();
    vibrationService.stopAlarmVibration();
    onDismiss();
  };

  const handleSnooze = () => {
    const mins = event.snoozeMinutes || 5;
    audioService.stopRinging();
    vibrationService.stopAlarmVibration();
    onSnooze(mins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white dark:bg-[#303134] rounded-3xl w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl border border-gray-100 dark:border-gray-700 animate-bounce-short">
        
        {/* Pulsing Alarm Icon Ring */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 animate-pulse">
            {event.source === 'timer' ? (
              <Clock className="w-12 h-12 stroke-[2.2]" />
            ) : (
              <Bell className="w-12 h-12 stroke-[2.2]" />
            )}
          </div>
          <div className="absolute -inset-2 rounded-full border-2 border-blue-400 dark:border-blue-500 animate-ping opacity-75 pointer-events-none" />
        </div>

        {/* Source & Title */}
        <span className="text-xs uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 mb-1">
          {event.source === 'timer' ? 'Timer Expired' : 'Alarm Ringing'}
        </span>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {event.label}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-8">
          <Volume2 className="w-4 h-4 text-blue-500" />
          <span>Playing sound: {event.sound}</span>
        </p>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="w-full py-4 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-md flex items-center justify-center gap-2 text-base transition-all"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Stop & Dismiss</span>
          </button>

          {/* Snooze Button */}
          <button
            onClick={handleSnooze}
            className="w-full py-3 rounded-full font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            Snooze (+{event.snoozeMinutes || 5} min)
          </button>
        </div>
      </div>
    </div>
  );
};

