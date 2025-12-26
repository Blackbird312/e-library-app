import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface Book {
  id: number;
  title: string;
  isbn: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  coverImage: string; // "/uploads/..."
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private API_URL = `${environment.baseUrl}/api/books`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Book[]>(this.API_URL);
  }

  searchBooksByTitle(title: string) {
    return this.http.get<Book[]>(`${this.API_URL}/search`, {
      params: { title },
    });
  }
}
