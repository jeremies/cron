export type SoundType = 'beep' | 'chime' | 'bell' | 'pulse';

export interface SoundOption {
  id: SoundType;
  name: string;
  description: string;
}

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  sound: SoundType;
  createdAt: number;
}

export interface LapTime {
  lapNumber: number;
  timeMs: number;
  deltaMs: number;
}

export interface AlarmItem {
  id: string;
  time: string; // "HH:MM" 24h format
  label: string;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  enabled: boolean;
  sound: SoundType;
  snoozeMinutes: number;
  lastTriggeredDate?: string; // YYYY-MM-DD
}

export interface RingingEvent {
  source: 'timer' | 'alarm';
  id: string;
  label: string;
  sound: SoundType;
  snoozeMinutes?: number;
}
