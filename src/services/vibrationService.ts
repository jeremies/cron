import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

class VibrationService {
  private vibrateInterval: number | null = null;

  public async tap(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch {
      // Ignored
    }
  }

  public async success(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (navigator.vibrate) {
        navigator.vibrate([40, 50, 40]);
      }
    } catch {
      // Ignored
    }
  }

  public startAlarmVibration(): void {
    this.stopAlarmVibration();

    const vibrateCycle = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          await Haptics.notification({ type: NotificationType.Warning });
        } else if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 400]);
        }
      } catch {
        // Ignored
      }
    };

    vibrateCycle();
    this.vibrateInterval = window.setInterval(vibrateCycle, 1200);
  }

  public stopAlarmVibration(): void {
    if (this.vibrateInterval !== null) {
      clearInterval(this.vibrateInterval);
      this.vibrateInterval = null;
    }
    if (navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch {
        // Ignored
      }
    }
  }
}

export const vibrationService = new VibrationService();

