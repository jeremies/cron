import { TimerItem, AlarmItem, LapTime } from '../types';

const STORAGE_KEYS = {
  TIMERS: 'cron_timers_v1',
  ACTIVE_TIMER_ID: 'cron_active_timer_id_v1',
  STOPWATCH_LAPS: 'cron_stopwatch_laps_v1',
  ALARMS: 'cron_alarms_v1',
  THEME: 'cron_theme_v1',
};

const DEFAULT_TIMERS: TimerItem[] = [
  {
    id: 'default-timer',
    label: 'Timer',
    totalSeconds: 300, // 5:00 matching user screenshot
    remainingSeconds: 300,
    isRunning: false,
    sound: 'beep',
    createdAt: Date.now(),
  },
  {
    id: 'tea-timer',
    label: 'Tea',
    totalSeconds: 180, // 3:00
    remainingSeconds: 180,
    isRunning: false,
    sound: 'chime',
    createdAt: Date.now() - 1000,
  },
  {
    id: 'workout-timer',
    label: 'Workout Rest',
    totalSeconds: 60, // 1:00
    remainingSeconds: 60,
    isRunning: false,
    sound: 'pulse',
    createdAt: Date.now() - 2000,
  }
];

const DEFAULT_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-1',
    time: '07:30',
    label: 'Wake Up',
    daysOfWeek: [1, 2, 3, 4, 5], // Mon - Fri
    enabled: true,
    sound: 'bell',
    snoozeMinutes: 5,
  },
  {
    id: 'alarm-2',
    time: '09:00',
    label: 'Weekend Stretch',
    daysOfWeek: [0, 6], // Sun, Sat
    enabled: false,
    sound: 'chime',
    snoozeMinutes: 10,
  }
];

export const storageService = {
  getTimers(): TimerItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMERS);
      return data ? JSON.parse(data) : DEFAULT_TIMERS;
    } catch {
      return DEFAULT_TIMERS;
    }
  },

  saveTimers(timers: TimerItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(timers));
    } catch (e) {
      console.warn('Could not save timers:', e);
    }
  },

  getActiveTimerId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER_ID) || 'default-timer';
  },

  saveActiveTimerId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER_ID, id);
  },

  getAlarms(): AlarmItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALARMS);
      return data ? JSON.parse(data) : DEFAULT_ALARMS;
    } catch {
      return DEFAULT_ALARMS;
    }
  },

  saveAlarms(alarms: AlarmItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
    } catch (e) {
      console.warn('Could not save alarms:', e);
    }
  },

  getStopwatchLaps(): LapTime[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STOPWATCH_LAPS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStopwatchLaps(laps: LapTime[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STOPWATCH_LAPS, JSON.stringify(laps));
    } catch (e) {
      console.warn('Could not save stopwatch laps:', e);
    }
  },

  getTheme(): 'light' | 'dark' | 'system' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | 'system') || 'system';
  },

  saveTheme(theme: 'light' | 'dark' | 'system'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
};
