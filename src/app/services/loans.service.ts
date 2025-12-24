import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from '../models/loan.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly apiUrl = `${environment.baseUrl}/api/loans`;

  constructor(private http: HttpClient) {}

  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}`);
  }
  // getLoans(userId: number): Observable<Loan[]> {
  //   return this.http.get<Loan[]>(`${this.apiUrl}?userId=${userId}`);
  // }
}
