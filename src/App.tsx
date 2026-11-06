import { useState, useEffect, useRef } from 'react';
import { Header, ActiveTab } from './components/Header';
import { TimerTab } from './components/TimerTab';
import { StopwatchTab } from './components/StopwatchTab';
import { AlarmTab } from './components/AlarmTab';
import { RingingModal } from './components/RingingModal';
import { TimerItem, AlarmItem, RingingEvent, SoundType } from './types';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { notificationService } from './services/notificationService';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');
  const [isMuted, setIsMuted] = useState<boolean>(() => audioService.isMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = storageService.getTheme();
    if (saved === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return saved;
  });

  // Timers & Alarms State
  const [timers, setTimers] = useState<TimerItem[]>(() => storageService.getTimers());
  const [activeTimerId, setActiveTimerId] = useState<string>(() => storageService.getActiveTimerId());
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => storageService.getAlarms());

  // Active Ringing Event (Overlay)
  const [ringingEvent, setRingingEvent] = useState<RingingEvent | null>(null);

  // Keep track of last triggered alarm minute to avoid duplicate rings within the same minute
  const lastAlarmTriggerRef = useRef<{ [alarmId: string]: string }>({});

  // Theme synchronization
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storageService.saveTheme(nextTheme);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    storageService.saveTimers(timers);
  }, [timers]);

  useEffect(() => {
    storageService.saveActiveTimerId(activeTimerId);
  }, [activeTimerId]);

  useEffect(() => {
    storageService.saveAlarms(alarms);
  }, [alarms]);

  // Request notifications permission on initial mount
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // Global Interval Loop for Timers and Alarms (Ticks every second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
      const todayDateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      // 1. Process Active Running Timers
      setTimers((prevTimers) => {
        let hasChanges = false;
        const updated = prevTimers.map((t) => {
          if (!t.isRunning) return t;

          const nextRemaining = t.remainingSeconds - 1;
          hasChanges = true;

          if (nextRemaining <= 0) {
            // Timer expired!
            notificationService.showImmediateNotification('Timer Finished!', `${t.label} is done.`);
            setRingingEvent({
              source: 'timer',
              id: t.id,
              label: t.label,
              sound: t.sound,
              snoozeMinutes: 5,
            });

            return {
              ...t,
              remainingSeconds: 0,
              isRunning: false,
            };
          }

          return {
            ...t,
            remainingSeconds: nextRemaining,
          };
        });

        return hasChanges ? updated : prevTimers;
      });

      // 2. Process Alarms
      alarms.forEach((alarm) => {
        if (!alarm.enabled) return;

        const isTimeMatch = alarm.time === currentTimeString;
        const isDayMatch = alarm.daysOfWeek.length === 0 || alarm.daysOfWeek.includes(currentDayOfWeek);
        const alreadyTriggeredKey = `${alarm.id}_${todayDateString}_${currentTimeString}`;

        if (isTimeMatch && isDayMatch && lastAlarmTriggerRef.current[alarm.id] !== alreadyTriggeredKey) {
          lastAlarmTriggerRef.current[alarm.id] = alreadyTriggeredKey;

          // Trigger Alarm!
          notificationService.showImmediateNotification(`Alarm: ${alarm.label}`, `It is ${alarm.time}`);
          setRingingEvent({
            source: 'alarm',
            id: alarm.id,
            label: alarm.label,
            sound: alarm.sound,
            snoozeMinutes: alarm.snoozeMinutes,
          });

          // If one-time alarm, disable it
          if (alarm.daysOfWeek.length === 0) {
            setAlarms((prev) =>
              prev.map((a) => (a.id === alarm.id ? { ...a, enabled: false } : a))
            );
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms]);

  // Timer Handlers
  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.remainingSeconds <= 0 && t.totalSeconds <= 0) return t;
        const willRun = !t.isRunning;
        if (willRun && t.remainingSeconds <= 0) {
          return { ...t, remainingSeconds: t.totalSeconds, isRunning: true };
        }
        return { ...t, isRunning: willRun };
      })
    );
  };

  const handleResetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t))
    );
  };

  const handleClearTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, remainingSeconds: 0, totalSeconds: 0, isRunning: false }
          : t
      )
    );
  };

  const handleAddSeconds = (id: string, extraSec: number) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newTotal = t.totalSeconds + extraSec;
        const newRem = t.remainingSeconds + extraSec;
        return { ...t, totalSeconds: newTotal, remainingSeconds: newRem };
      })
    );
  };

  const handleCreateTimer = (label: string, totalSeconds: number, sound: SoundType) => {
    const newTimer: TimerItem = {
      id: `timer-${Date.now()}`,
      label,
      totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: true,
      sound,
      createdAt: Date.now(),
    };
    setTimers((prev) => [newTimer, ...prev]);
    setActiveTimerId(newTimer.id);
  };

  const handleUpdateTimer = (id: string, label: string, totalSeconds: number, sound: SoundType) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              label,
              totalSeconds,
              remainingSeconds: totalSeconds,
              isRunning: false,
              sound,
            }
          : t
      )
    );
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (activeTimerId === id && remaining.length > 0) {
        setActiveTimerId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Alarm Handlers
  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleSaveAlarm = (alarmData: Omit<AlarmItem, 'id'>, existingId?: string) => {
    if (existingId) {
      setAlarms((prev) =>
        prev.map((a) => (a.id === existingId ? { ...a, ...alarmData } : a))
      );
    } else {
      const newAlarm: AlarmItem = {
        id: `alarm-${Date.now()}`,
        ...alarmData,
      };
      setAlarms((prev) => [...prev, newAlarm]);
    }
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  // Ringing Modal Handlers
  const handleDismissRinging = () => {
    setRingingEvent(null);
  };

  const handleSnoozeRinging = (minutes: number) => {
    if (!ringingEvent) return;

    if (ringingEvent.source === 'timer') {
      const timerId = ringingEvent.id;
      setTimers((prev) =>
        prev.map((t) =>
          t.id === timerId
            ? {
                ...t,
                remainingSeconds: minutes * 60,
                isRunning: true,
              }
            : t
        )
      );
    } else {
      // Alarm snooze: calculate time in X minutes
      const now = new Date(Date.now() + minutes * 60 * 1000);
      const snoozeH = now.getHours().toString().padStart(2, '0');
      const snoozeM = now.getMinutes().toString().padStart(2, '0');
      const snoozedAlarm: AlarmItem = {
        id: `snooze-${Date.now()}`,
        time: `${snoozeH}:${snoozeM}`,
        label: `${ringingEvent.label} (Snoozed)`,
        daysOfWeek: [],
        enabled: true,
        sound: ringingEvent.sound,
        snoozeMinutes: minutes,
      };
      setAlarms((prev) => [...prev, snoozedAlarm]);
    }

    setRingingEvent(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafd] dark:bg-[#202124] text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto pt-2 sm:pt-4 px-2 sm:px-4">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 sm:py-8 flex flex-col justify-center items-center">
        {activeTab === 'timer' && (
          <TimerTab
            timers={timers}
            activeTimerId={activeTimerId}
            setActiveTimerId={setActiveTimerId}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onClearTimer={handleClearTimer}
            onAddSeconds={handleAddSeconds}
            onCreateTimer={handleCreateTimer}
            onUpdateTimer={handleUpdateTimer}
            onDeleteTimer={handleDeleteTimer}
          />
        )}

        {activeTab === 'stopwatch' && <StopwatchTab />}

        {activeTab === 'alarm' && (
          <AlarmTab
            alarms={alarms}
            onToggleAlarm={handleToggleAlarm}
            onSaveAlarm={handleSaveAlarm}
            onDeleteAlarm={handleDeleteAlarm}
          />
        )}
      </main>

      {/* Active Ringing Overlay Modal */}
      <RingingModal
        event={ringingEvent}
        onDismiss={handleDismissRinging}
        onSnooze={handleSnoozeRinging}
      />

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-gray-400 dark:text-gray-600 select-none">
        Timer &bull; Stopwatch &bull; Alarm &mdash; Offline PWA &amp; Capacitor App
      </footer>
    </div>
  );
}

export default App;

