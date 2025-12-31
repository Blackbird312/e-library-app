import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface DeviceRegisterPayload {
  token: string;
  platform: string;
  deviceId?: string;
}

@Injectable({ providedIn: 'root' })
export class PushBackendService {
  private readonly baseUrl = `${environment.baseUrl}/api/push`; // or environment.apiUrl

  constructor(private http: HttpClient) {}

  register(payload: DeviceRegisterPayload) {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  unregister() {
    return this.http.post(`${this.baseUrl}/unregister`, {});
  }

  heartbeat() {
    return this.http.post(`${this.baseUrl}/heartbeat`, {});
  }
}
