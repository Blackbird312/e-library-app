import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonNote,
  IonText,
  IonRefresher,
  IonRefresherContent,
  IonLoading
} from '@ionic/angular/standalone';

import { UserResponse, UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,

    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,

    IonItem,
    IonLabel,
    IonNote,
    IonText,

    IonRefresher,
    IonRefresherContent,
    IonLoading
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: UserResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadMe();
  }

  ionViewWillEnter() {
    this.loadMe();
  }

  loadMe(event?: any) {
    this.loading = true;
    this.error = null;

    this.userService.me()
      .pipe(finalize(() => {
        this.loading = false;
        event?.target?.complete?.();
      }))
      .subscribe({
        next: (u) => this.user = u,
        error: (err) => {
          if (err?.status === 401) {
            this.error = 'Session expired. Please login again.';
            this.auth.logout();
          } else {
            this.error = err?.error?.message || 'Failed to load profile';
          }
        }
      });
  }

  logout() {
    this.auth.logout();
    // navigate to login if needed
  }
}
