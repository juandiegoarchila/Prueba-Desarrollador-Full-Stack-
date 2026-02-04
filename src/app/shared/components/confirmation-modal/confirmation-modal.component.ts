import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * @component ConfirmationModalComponent
 * @description
 * Modal de confirmación reutilizable para operaciones críticas que requieren confirmación del usuario.
 * Se utiliza principalmente en el checkout del carrito para mostrar el resumen del pedido antes de confirmar.
 * 
 * **PATRÓN DE MODAL EN IONIC:**
 * Los modales en Ionic se presentan de forma programática usando ModalController:
 * 1. El componente padre crea el modal: modalCtrl.create({ component: ConfirmationModalComponent })
 * 2. Se pasan datos al modal mediante componentProps: { title: '...', message: '...', total: 150000 }
 * 3. Se presenta el modal: await modal.present()
 * 4. Se espera el resultado: const { data } = await modal.onDidDismiss()
 * 5. El modal se cierra con modalCtrl.dismiss({ confirmed: true/false })
 * 
 * **FLUJO DE CONFIRMACIÓN:**
 * ```
 * Usuario hace click "Finalizar Compra" en cart.page.ts
 *     ↓
 * Se abre este modal con resumen (subtotal, IVA, total)
 *     ↓
 * Usuario hace click "Confirmar" → dismiss({ confirmed: true })
 * Usuario hace click "Cancelar" → dismiss({ confirmed: false })
 *     ↓
 * cart.page.ts recibe el resultado y procede o cancela
 * ```
 * 
 * **CÁLCULOS DE IVA:**
 * El modal muestra el desglose del precio total incluyendo IVA del 19%:
 * - Subtotal (Base): total / 1.19 → Precio sin IVA
 * - IVA (19%): total - (total / 1.19) → Monto del impuesto
 * - Total: Precio original ya incluye IVA
 * 
 * @example
 * // En cart.page.ts:
 * async confirmPurchase() {
 *   const modal = await this.modalCtrl.create({
 *     component: ConfirmationModalComponent,
 *     componentProps: {
 *       title: 'Confirmar pedido',
 *       message: '¿Deseas finalizar tu compra?',
 *       total: this.cartTotal
 *     }
 *   });
 *   await modal.present();
 *   const { data } = await modal.onDidDismiss();
 *   if (data?.confirmed) {
 *     // Procesar orden...
 *   }
 * }
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
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
  /**
   * @property title
   * @description
   * Título principal del modal, mostrado en la parte superior con ícono de interrogación.
   * 
   * @type {string}
   * @default 'Confirmación'
   * @example title="Confirmar pedido"
   */
  @Input() title: string = 'Confirmación';

  /**
   * @property message
   * @description
   * Mensaje descriptivo que explica la acción que se va a confirmar.
   * Se muestra debajo del título en color gris.
   * 
   * @type {string}
   * @default '¿Estás seguro de realizar esta acción?'
   * @example message="¿Deseas finalizar la compra de estos productos?"
   */
  @Input() message: string = '¿Estás seguro de realizar esta acción?';

  /**
   * @property total
   * @description
   * Monto total del pedido (ya incluye IVA del 19%).
   * Si es mayor a 0, se muestra un recuadro con el desglose detallado:
   * - Subtotal base (sin IVA): calculado como total / 1.19
   * - IVA (19%): calculado como total - (total / 1.19)
   * - Envío: "Gratis" (hardcoded)
   * - Total final: valor recibido
   * 
   * Si es 0, no se muestra el recuadro de resumen (*ngIf="total > 0").
   * 
   * **FÓRMULA IVA:**
   * Si total = 119,000 (con IVA incluido):
   * - Base: 119,000 / 1.19 = 100,000
   * - IVA: 119,000 - 100,000 = 19,000
   * 
   * @type {number}
   * @default 0 - No muestra resumen si no se proporciona
   * @example total="150000" // $150,000 COP
   */
  @Input() total: number = 0;

  constructor(private modalCtrl: ModalController) {}

  /**
   * @method cancel
   * @description
   * Cierra el modal indicando que el usuario canceló la acción.
   * Emite { confirmed: false } como resultado para que el componente padre sepa que se canceló.
   * 
   * **PARÁMETROS DE DISMISS:**
   * - Primer argumento: Datos a devolver al componente padre
   * - Segundo argumento: Rol/razón del dismiss (útil para analytics o logging)
   * 
   * @returns {Promise<boolean>} Promise que resuelve cuando el modal se cierra
   */
  cancel(): void {
    this.modalCtrl.dismiss({ confirmed: false }, 'cancel');
  }

  /**
   * @method confirm
   * @description
   * Cierra el modal indicando que el usuario confirmó la acción.
   * Emite { confirmed: true } como resultado para que el componente padre proceda con la operación.
   * 
   * **FLUJO DESPUÉS DE CONFIRMAR:**
   * 1. Se cierra el modal con confirmed: true
   * 2. cart.page.ts recibe data.confirmed === true
   * 3. Se ejecuta placeOrder() para crear la orden
   * 4. Se limpia el carrito y se navega a /confirm
   * 
   * @returns {Promise<boolean>} Promise que resuelve cuando el modal se cierra
   */
  confirm(): void {
    this.modalCtrl.dismiss({ confirmed: true }, 'confirm');
  }
}

