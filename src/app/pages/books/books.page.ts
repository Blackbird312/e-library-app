import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonThumbnail,
  IonImg,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonChip,
} from '@ionic/angular/standalone';

import { Book, BookService } from 'src/app/services/books.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonThumbnail,
    IonImg,
    IonSkeletonText,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonChip,
  ],
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
})
export class BooksPage {
  books: Book[] = [];
  loading = false;
  error: string | null = null;

  // used to convert "/uploads/..." => "http://localhost:8080/uploads/..."
  readonly baseUrl = environment.baseUrl;

  constructor(private bookService: BookService) {}

  ionViewWillEnter() {
    this.loadBooks();
  }

  loadBooks(event?: any) {
    this.loading = true;
    this.error = null;

    this.bookService.getAll()
      .pipe(finalize(() => {
        this.loading = false;
        event?.target?.complete?.();
      }))
      .subscribe({
        next: (data) => this.books = data ?? [],
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load books';
        },
      });
  }

  coverUrl(coverImage: string | null | undefined) {
    if (!coverImage) return '';
    // if backend already returns absolute URL, keep it
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) return coverImage;
    // otherwise prefix baseUrl
    return `${this.baseUrl}${coverImage}`;
  }

  availabilityText(b: Book) {
    return `${b.availableCopies}/${b.totalCopies} available`;
  }

  availabilityColor(b: Book) {
    if (b.availableCopies <= 0) return 'danger';
    if (b.availableCopies <= 2) return 'warning';
    return 'success';
  }
}
