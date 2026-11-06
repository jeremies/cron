export function formatSeconds(totalSeconds: number): { display: string; hours?: number; minutes: number; seconds: number } {
  const isNegative = totalSeconds < 0;
  const absSec = Math.abs(totalSeconds);

  const hours = Math.floor(absSec / 3600);
  const minutes = Math.floor((absSec % 3600) / 60);
  const seconds = absSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  let display = '';
  if (hours > 0) {
    display = `${hours}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    // Google search style: if minutes < 10, does not pad minutes (e.g. 5:00)
    display = `${minutes}:${pad(seconds)}`;
  }

  if (isNegative) {
    display = `-${display}`;
  }

  return { display, hours, minutes, seconds };
}

export function formatStopwatchMs(ms: number): { formatted: string; minutes: string; seconds: string; centiseconds: string } {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const minStr = pad(minutes);
  const secStr = pad(seconds);
  const csStr = pad(centiseconds);

  return {
    formatted: `${minStr}:${secStr}.${csStr}`,
    minutes: minStr,
    seconds: secStr,
    centiseconds: csStr,
  };
}

export function formatAlarmTime(time24: string): { time12: string; period: string } {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return {
    time12: `${h}:${mStr}`,
    period
  };
}

export function getTimeUntilAlarm(alarmTime: string, daysOfWeek: number[]): string {
  const now = new Date();
  const [targetH, targetM] = alarmTime.split(':').map(Number);

  let minDiffMs = Infinity;

  // If no specific days selected, it's a one-time alarm for today or tomorrow
  const checkDays = daysOfWeek.length > 0 ? daysOfWeek : [now.getDay(), (now.getDay() + 1) % 7];

  for (const day of checkDays) {
    const candidate = new Date(now);
    candidate.setHours(targetH, targetM, 0, 0);

    let dayDiff = day - now.getDay();
    if (dayDiff < 0 || (dayDiff === 0 && candidate.getTime() <= now.getTime())) {
      dayDiff += 7;
    }
    candidate.setDate(candidate.getDate() + dayDiff);

    const diff = candidate.getTime() - now.getTime();
    if (diff > 0 && diff < minDiffMs) {
      minDiffMs = diff;
    }
  }

  if (minDiffMs === Infinity) return '';

  const totalMinutes = Math.round(minDiffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0 && minutes === 0) return 'in less than a minute';
  if (hours === 0) return `in ${minutes}m`;
  if (minutes === 0) return `in ${hours}h`;
  return `in ${hours}h ${minutes}m`;
}
