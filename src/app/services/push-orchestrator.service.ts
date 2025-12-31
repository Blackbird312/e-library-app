import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';

import { PushService } from './push.service';
import { environment } from 'src/environments/environment';

type RegisterPayload = {
  token: string;
  platform: string;
  deviceId?: string;
};

@Injectable({ providedIn: 'root' })
export class PushOrchestratorService {
  private readonly API_URL = `${environment.baseUrl}/api/push`; // <-- replace with environment.apiUrl

  constructor(
    private push: PushService,
    private http: HttpClient,
  ) {}

  /**
   * Call this after login (JWT already stored) OR on app start if user is already logged in.
   * It will:
   *  - init push permissions + register (PushService.init)
   *  - wait for token
   *  - POST /api/push/register (JWT should be attached by your interceptor)
   */
  async start(): Promise<void> {
    // 1) Ensure PushService is initialized (permissions + registration + listeners)
    await this.push.init();

    // 2) Wait for the token emitted by PushService
    const token = await firstValueFrom(this.push.token$);
    if (!token) return;

    // 3) Collect device metadata (optional but recommended)
    const [deviceId] = await Promise.all([Device.getId()]);

    const payload: RegisterPayload = {
      token,
      platform: Capacitor.getPlatform(),
      deviceId: deviceId.identifier ?? undefined,
    };

    // 4) Register to backend (1 device/user, replace on change)
    // If token is already used by another user, backend should return 409
    await firstValueFrom(
      this.http.post(`${this.API_URL}/register`, payload)
    );
  }

  /**
   * Call this on logout (optional but recommended).
   */
  async stop(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.API_URL}/unregister`, {}));
  }

  /**
   * Optional: keep last_seen updated (call daily or on app resume).
   */
  async heartbeat(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.API_URL}/heartbeat`, {}));
  }
}
