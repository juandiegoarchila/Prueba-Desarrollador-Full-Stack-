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
      
      <div *ngIf="total > 0" class="order-summary-box">
             <div class="summary-line">
                <span>Subtotal (Base)</span>
                <span>{{ total / 1.19 | currency:'COP':'symbol':'1.0-0' }}</span>
             </div>
             <div class="summary-line">
                <span>IVA (19%)</span>
                <span>{{ total - (total / 1.19) | currency:'COP':'symbol':'1.0-0' }}</span>
             </div>
             <div class="summary-line">
                <span>Envío</span>
                <span class="free-text">Gratis</span>
             </div>
             <div class="separator"></div>
             <div class="total-line">
                <span>Total a pagar:</span>
                <span class="total-val">{{ total | currency:'COP':'symbol':'1.0-0' }}</span>
             </div>
      </div>

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
    p { margin: 0 0 20px; line-height: 1.5; }

    .order-summary-box {
        width: 100%;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 25px;
    }
    .summary-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 13px;
        color: #6c757d;
    }
    .free-text { color: var(--ion-color-success); font-weight: 700; }
    .separator { height: 1px; background: #dee2e6; margin: 8px 0; }
    .total-line {
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        color: var(--ion-color-dark);
        font-size: 15px;
    }
    
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
  @Input() total: number = 0;

  constructor(private modalCtrl: ModalController) {}

  cancel() {
    this.modalCtrl.dismiss({ confirmed: false }, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss({ confirmed: true }, 'confirm');
  }
}

