import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Loan } from '../models/loan.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly apiUrl = `${environment.baseUrl}/api/loans`;
  private readonly loansSubject = new BehaviorSubject<Loan[]>([]);
  readonly loans$ = this.loansSubject.asObservable();
  constructor(private http: HttpClient) { }

  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/me`);
  }

  // ✅ call this whenever you want to refetch and update cache
  refreshMyLoans(): Observable<Loan[]> {
    return this.getLoans().pipe(
      tap((loans) => this.loansSubject.next(loans ?? []))
    );
  }

  postLoan(bookId: number, dueDate: string): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/iborrow`, { bookId, dueDate });
  }

  postReturnLoan(bookId:number):Observable<Loan>{
    return this.http.post<Loan>(`${this.apiUrl}/${bookId}/return`, {});
  }
}
