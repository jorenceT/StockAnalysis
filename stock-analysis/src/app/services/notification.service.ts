import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  async initPermissions(): Promise<void> {
    try {
      await LocalNotifications.requestPermissions();
    } catch {
      // Web fallback: no-op
    }
  }

  async notify(id: number, title: string, body: string): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [{ id, title, body, schedule: { at: new Date(Date.now() + 2000) } }]
      });
    } catch {
      console.log(`[Notification] ${title}: ${body}`);
    }
  }
}
