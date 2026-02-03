import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastController: ToastController) { }

  async showSuccess(message: string) {
      const toast = await this.toastController.create({
          message,
          duration: 2000,
          color: 'success',
          position: 'bottom'
      });
      toast.present();
  }

  async showError(message: string) {
      const toast = await this.toastController.create({
          message,
          duration: 3000,
          color: 'danger',
          position: 'bottom'
      });
      toast.present();
  }

  async showInfo(message: string) {
      const toast = await this.toastController.create({
          message,
          duration: 2000,
          color: 'medium',
          position: 'bottom'
      });
      toast.present();
  }
}
