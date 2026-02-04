import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastController: ToastController) { }

  async showSuccess(message: string) {
      await this.presentToast(message, 'success', 'checkmark-circle-outline');
  }

  async showError(message: string) {
      await this.presentToast(message, 'danger', 'alert-circle-outline');
  }

  async showInfo(message: string) {
      await this.presentToast(message, 'primary', 'information-circle-outline');
  }

  async showWarning(message: string) {
      await this.presentToast(message, 'warning', 'warning-outline');
  }

  private async presentToast(message: string, color: string, icon: string) {
      const toast = await this.toastController.create({
          message,
          icon,
          duration: 3000,
          color,
          position: 'bottom',
          buttons: [{ icon: 'close', role: 'cancel', handler: () => {} }],
          cssClass: 'custom-toast'
      });
      await toast.present();
  }
}
