import { Injectable, NgZone } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import {
  PushNotifications,
  PushNotificationSchema,
  ActionPerformed,
  Token,
  PermissionStatus,
} from '@capacitor/push-notifications';
import { ToastController } from '@ionic/angular';
import { NotificationInboxService } from './notification-inbox.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PushService {
  private tokenSubject = new ReplaySubject<string>(1);
  token$ = this.tokenSubject.asObservable();

  constructor(
    private toastCtrl: ToastController,
    private inbox: NotificationInboxService,
    private router: Router,
    private zone: NgZone
  ) {}

  async init() {
    let permStatus: PermissionStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('FCM token:', token.value);
      this.tokenSubject.next(token.value); // ✅ expose token
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (n: PushNotificationSchema) => {
      this.zone.run(async () => {
        const title = n.title ?? 'Notification';
        const body = n.body ?? '';

        this.inbox.add({
          id: (globalThis.crypto?.randomUUID?.() ?? String(Date.now())),
          title,
          body,
          receivedAt: Date.now(),
          data: (n.data ?? {}) as any,
        });

        const toast = await this.toastCtrl.create({
          header: title,
          message: body || '(no body)',
          duration: 3500,
          position: 'top',
          buttons: [
            {
              text: 'Open',
              handler: () => this.handleNavigation(n.data),
            },
          ],
        });

        await toast.present();
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      this.zone.run(() => {
        const n = action.notification;

        this.inbox.add({
          id: (globalThis.crypto?.randomUUID?.() ?? String(Date.now())),
          title: n.title ?? 'Notification',
          body: n.body ?? '',
          receivedAt: Date.now(),
          data: (n.data ?? {}) as any,
        });

        this.handleNavigation(n.data);
      });
    });
  }

  private handleNavigation(data?: Record<string, any>) {
    if (!data) {
      this.router.navigate(['/notifications']);
      return;
    }

    const screen = data['screen'];
    if (screen === 'order-details' && data['orderId']) {
      this.router.navigate(['/orders', data['orderId']]);
      return;
    }

    this.router.navigate(['/notifications']);
  }
}
