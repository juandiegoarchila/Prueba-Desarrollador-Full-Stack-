import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirmation-modal',
  template: `
    <div class="modal-wrapper ion-padding">
      <div class="icon-header ion-text-center">
         <ion-icon name="help-circle-outline" color="primary"></ion-icon>
      </div>
      
      <h2 class="text-bold ion-text-center">{{ title }}</h2>
      <p class="text-medium text-muted ion-text-center">{{ message }}</p>
      
      <div class="actions">
        <ion-button expand="block" fill="outline" color="medium" (click)="cancel()" class="action-btn">
          Cancelar
        </ion-button>
        <ion-button expand="block" color="primary" (click)="confirm()" class="action-btn">
          Confirmar
        </ion-button>
      </div>
    </div>
  `,
  styles: [`
    .modal-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 30px;
    }
    .icon-header ion-icon {
        font-size: 60px;
        margin-bottom: 10px;
    }
    h2 { margin: 0 0 10px; color: var(--ion-color-tertiary); }
    p { margin: 0 0 30px; line-height: 1.5; }
    
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      width: 100%;
    }
    .action-btn { margin: 0; --box-shadow: none; font-weight: 600; }
  `]
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Confirmación';
  @Input() message: string = '¿Estás seguro de realizar esta acción?';

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss({ confirmed: false }, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss({ confirmed: true }, 'confirm');
  }
}

