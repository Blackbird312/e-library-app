import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'primary',
    duration = 2500
  ) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color,
      buttons: [{ text: 'OK', role: 'cancel' }],
    });

    await toast.present();
  }
}
