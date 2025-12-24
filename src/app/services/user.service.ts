import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  membershipDate: string; // LocalDate -> ISO string
  loanCount: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private API_URL = `${environment.baseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  me() {
    return this.http.get<UserResponse>(`${this.API_URL}/me`);
  }
}
