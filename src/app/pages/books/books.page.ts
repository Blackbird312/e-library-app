import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonButton,
  IonBadge,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { Book, BookService } from 'src/app/services/books.service';
import { environment } from 'src/environments/environment';
import { LoanService } from 'src/app/services/loans.service';
import { ToastService } from 'src/app/services/toast.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-books',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonSkeletonText,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonButton,
    IonBadge,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonSearchbar
  ],
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
})
export class BooksPage implements OnInit {
  books: Book[] = [];
  loading = false;
  error: string | null = null;
  viewMode: 'grid' | 'list' = 'grid';

  readonly baseUrl = environment.baseUrl;

  constructor(
    private bookService: BookService,
    private loanService: LoanService,
    private router: Router,
    private alertController: AlertController,
    private toast: ToastService,
    private route: ActivatedRoute
  ) { }

  isFocused = false;

  onSearchFocus() {
    this.isFocused = true;
  }

  onSearchBlur() {
    this.isFocused = false;
  }

  searchTerm = '';

  onSearch() {
    const title = this.searchTerm.trim();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { title: title || null }, // null removes it from URL
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const title = (params.get('title') || '').trim();

      this.searchTerm = title;

      if (!title) {
        this.loadBooks();
        return;
      }

      this.filterBooks(title);
    });
  }


  private defaultDueDateISO(daysAhead = 30): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);

    // "YYYY-MM-DD" (what Spring expects for LocalDate)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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

  coverUrl() {
    return `https://picsum.photos/300/500`;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    img.parentElement?.querySelector('.cover-fallback')?.classList.remove('hidden');
  }

  availabilityPercentage(book: Book): number {
    if (book.totalCopies === 0) return 0;
    return Math.round((book.availableCopies / book.totalCopies) * 100);
  }

  onViewChange(event: any) {
    this.viewMode = event.detail.value;
  }

  viewBookDetails(book: Book) {
    this.router.navigate(['/books', book.id]);
  }

  async borrowBook(event: Event, book: Book) {
    event.stopPropagation();

    const dueDate = this.defaultDueDateISO(30);

    if (book.availableCopies === 0) {
      const alert = await this.alertController.create({
        header: 'Not Available',
        message: 'This book is currently not available for borrowing.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Borrow Book',
      message: `Confirm borrowing "${book.title}"?\n\nDue date: ${dueDate}\n\nYou can return it before this date.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Borrow',
          handler: () => {
            this.loanService.postLoan(book.id, dueDate).subscribe({
              next: async () => {
                await this.toast.showToast(
                  `📚 "${book.title}" borrowed successfully!`,
                  'success'
                );
                this.loadBooks();
                this.loanService.refreshMyLoans().subscribe({
                  error: (err) => console.error('Failed to refresh loans', err),
                });

                this.router.navigate(['/tabs/home']);
              },
              error: async (err) => {
                console.error(err);
                const message =
                  err?.error?.message ??
                  'Unable to borrow the book. Please try again.';

                await this.toast.showToast(message, 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // Optional: Filtering functionality
  filterBooks(title: string) {
    this.bookService.searchBooksByTitle(title)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.books = data ?? [];
        },
        error: async (err) => {
          this.error = err?.error?.message || `No books found for "${title}"`;
          await this.toast.showToast(this.error as string, 'danger');
          this.books = [];
        },
      });
  }
}