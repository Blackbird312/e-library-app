import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { PushOrchestratorService } from './push-orchestrator.service';

type LoginPayload = {
  username: string;
  password: string;
};

type LoginBodyResponse = {
  token?: string;       // if backend returns { token: "..." }
  accessToken?: string; // if backend returns { accessToken: "..." }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly TOKEN_KEY = 'token';

  private token: string | null = null;

  private tokenSubject = new BehaviorSubject<string | null>(null);

  /** ✅ true/false stream for guards/UI */
  readonly isAuthenticated$ = this.tokenSubject.asObservable().pipe(
    map(t => !!t)
  );

  constructor(private http: HttpClient, private router: Router, private pushOrchestrator: PushOrchestratorService) { }

  /**
   * Call once on app start (AppComponent) so guards/interceptor work on cold start.
   */
  init(): Observable<void> {
    return from(Preferences.get({ key: AuthService.TOKEN_KEY })).pipe(
      tap(({ value }) => {
        this.token = value ?? null;
        this.tokenSubject.next(this.token);
      }),
      map(() => void 0)
    );
  }


  /** Sync for interceptor */
  getTokenSync(): string | null {
    return this.token;
  }

  /** Sync for your current guards */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Login:
   * - If token is in JSON body -> extract it
   * - If token is in Authorization header -> extract it
   * (supports both)
   */
  login(payload: LoginPayload): Observable<void> {
    const url = `${environment.baseUrl}/api/auth/login`;

    return this.http
      .post<LoginBodyResponse>(url, payload, { observe: 'response' })
      .pipe(
        map((res: HttpResponse<LoginBodyResponse>) => {
          // 1) Try header: Authorization: Bearer <token>
          const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');
          if (authHeader?.startsWith('Bearer ')) {
            return authHeader.replace('Bearer ', '').trim();
          }

          // 2) Try body: { token }
          const body = res.body ?? {};
          const token = body.token || body.accessToken;

          return token ?? null;
        }),
        switchMap((token) => {
          if (!token) {
            return throwError(() => new Error('No token returned from login.'));
          }
          return this.setToken(token).pipe(tap(() => {
            // After login, start push orchestrator to register the device to the backend.
            this.pushOrchestrator.start().catch(err => {
              console.error('PushOrchestrator start error after login:', err);
            });
          }));
        }),
        map(() => void 0),
        catchError((err) => throwError(() => err))
      );
  }

  logout(): Observable<void> {
    return from(this.pushOrchestrator.stop()).pipe(
      catchError(() => from([void 0])), // don't block logout if unregister fails
      concatMap(() => this.setToken(null))
    );
  }

  me(): Observable<any> {
    const url = `${environment.baseUrl}/api/auth/me`;
    return this.http.get(url);
  }

  /** Internal: updates memory + Preferences */
  private setToken(token: string | null): Observable<void> {
    this.token = token;
    this.tokenSubject.next(token);

    if (token) {
      return from(Preferences.set({ key: AuthService.TOKEN_KEY, value: token })).pipe(map(() => void 0));
    }
    return from(Preferences.remove({ key: AuthService.TOKEN_KEY })).pipe(map(() => void 0));
  }
}
