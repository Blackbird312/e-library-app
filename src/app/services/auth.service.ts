import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API_URL = `${environment.baseUrl}/api/auth`;;

  constructor(
    private http: HttpClient, 
    private router: Router
  ) { }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.API_URL}/login`, {
      username,
      password
    }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login').then(() => {
      window.location.reload();
    });
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}
