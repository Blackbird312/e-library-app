import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';

import {
  InAppNotification,
  NotificationInboxService,
} from '../../services/notification-inbox.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage {
  items$: Observable<InAppNotification[]> = this.inbox.items$;

  constructor(private inbox: NotificationInboxService) {}

  clear() {
    this.inbox.clear();
  }

  trackById(_: number, item: InAppNotification) {
    return item.id;
  }
}
