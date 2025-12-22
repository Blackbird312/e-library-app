import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Loan } from '../../models/loan.model';
import { LoanService } from 'src/app/services/loans.service';

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

  constructor(private loanService: LoanService) {}

  ngOnInit() {
    this.loadLoans();
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
}
