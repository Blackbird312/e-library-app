import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Loan } from '../../models/loan.model';
import { LoanService } from 'src/app/services/loans.service';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    DatePipe, // enables |date pipe in template
  ],
})
export class HomePage implements OnInit {

  loans: Loan[] = [];
  loading = true;
  error?: string;

  constructor(
    private loanService: LoanService,
    private toast: ToastService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadLoans();
  }

  // In your component
  isCompactView = false;

  toggleCompactView() {
    this.isCompactView = !this.isCompactView;
  }

  isOverdue(dueDate: Date | string): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  }

  getDaysRemaining(dueDate: Date | string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getProgressPercentage(loanDate: Date | string, dueDate: Date | string): number {
    const loan = new Date(loanDate);
    const due = new Date(dueDate);
    const today = new Date();

    const totalLoanTime = due.getTime() - loan.getTime();
    const elapsedTime = today.getTime() - loan.getTime();

    if (elapsedTime <= 0) return 0;
    if (elapsedTime >= totalLoanTime) return 100;

    return Math.min(100, Math.max(0, (elapsedTime / totalLoanTime) * 100));
  }

  loadLoans(event?: any) {
    this.loading = true;

    this.loanService.getLoans().subscribe({
      next: (data) => {
        this.loans = data;
        this.loading = false;
        event?.target.complete();
      },
      error: () => {
        this.error = 'Failed to load loans';
        this.loading = false;
        event?.target.complete();
      }
    });
  }

  getBookImage(coverImage?: string | null): string {
    if (!coverImage) return 'assets/book-placeholder.png';

    // If backend already returns full URL
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
      return coverImage;
    }

    // If backend returns "/uploads/..."
    return `${environment.baseUrl}${coverImage}`;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/book-placeholder.png';
  }

  async returnLoan(event: Event, bookId: number, bookTitle?: string) {
    event.stopPropagation(); // Prevent triggering other click events
    const alert = await this.alertController.create({
      header: 'Borrow Book',
      message: `Confirm you want to return this book? - ${bookTitle}`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Return',
          handler: () => {
            this.loanService.postReturnLoan(bookId).subscribe({
              next: async () => {
                await this.toast.showToast(
                  `📚 "Book returned successfully!`,
                  'success'
                );

                this.loadLoans(); // Refresh the loans list after returning
              },
              error: async (err) => {
                const message = err?.error?.message || 'Unable to return the book. Please try again.';
                await this.toast.showToast(message, 'danger');
              }
            })
          }
        }
      ]
    });
    await alert.present();
  }
}