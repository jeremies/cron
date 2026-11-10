import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

class NotificationService {
  private hasPermission: boolean = false;

  constructor() {
    this.checkPermission();
  }

  public async requestPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const res = await LocalNotifications.requestPermissions();
        this.hasPermission = res.display === 'granted';
        return this.hasPermission;
      } else if ('Notification' in window) {
        const status = await Notification.requestPermission();
        this.hasPermission = status === 'granted';
        return this.hasPermission;
      }
    } catch (err) {
      console.warn('Failed to request notification permissions:', err);
    }
    return false;
  }

  private async checkPermission(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        const res = await LocalNotifications.checkPermissions();
        this.hasPermission = res.display === 'granted';
      } else if ('Notification' in window) {
        this.hasPermission = Notification.permission === 'granted';
      }
    } catch {
      this.hasPermission = false;
    }
  }

  public async scheduleTimerNotification(id: string, title: string, body: string, delaySeconds: number): Promise<void> {
    const notifyAt = new Date(Date.now() + delaySeconds * 1000);
    const numericId = this.stringToNumericId(id);

    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: numericId,
              title: title,
              body: body,
              schedule: { at: notifyAt },
              sound: 'beep.wav',
              actionTypeId: 'TIMER_EXPIRED',
              extra: { stringId: id }
            }
          ]
        });
      }
      // Note: for Web PWA, if window remains backgrounded, service worker or in-app interval triggers Web Notification
    } catch (err) {
      console.warn('Failed to schedule native notification:', err);
    }
  }

  public async cancelScheduledNotification(id: string): Promise<void> {
    const numericId = this.stringToNumericId(id);
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.cancel({
          notifications: [{ id: numericId }]
        });
      }
    } catch (err) {
      console.warn('Failed to cancel notification:', err);
    }
  }

  public async showImmediateNotification(title: string, body: string): Promise<void> {
    if (!this.hasPermission) {
      await this.requestPermission();
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 100000),
              title: title,
              body: body,
              sound: 'beep.wav'
            }
          ]
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          vibrate: [200, 100, 200],
        } as NotificationOptions);
      }
    } catch (err) {
      console.warn('Failed to show immediate notification:', err);
    }
  }

  private stringToNumericId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 10000000) + 1;
  }
}

export const notificationService = new NotificationService();

