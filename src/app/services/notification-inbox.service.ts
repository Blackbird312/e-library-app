import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type InAppNotification = {
  id: string;
  title?: string;
  body?: string;
  receivedAt: number;
  data?: Record<string, any>;
};

@Injectable({ providedIn: 'root' })
export class NotificationInboxService {
  private readonly _items = new BehaviorSubject<InAppNotification[]>([]);
  readonly items$ = this._items.asObservable();

  add(item: InAppNotification) {
    const current = this._items.value;
    this._items.next([item, ...current].slice(0, 50)); // keep last 50
  }

  clear() {
    this._items.next([]);
  }
}
