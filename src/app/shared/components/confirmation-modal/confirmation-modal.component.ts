import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirmation-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>{{ message }}</p>
      <div class="actions">
        <ion-button color="medium" (click)="cancel()">Cancelar</ion-button>
        <ion-button color="primary" (click)="confirm()">Confirmar</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Confirmación';
  @Input() message: string = '¿Estás seguro?';

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(true, 'confirm');
  }
}
