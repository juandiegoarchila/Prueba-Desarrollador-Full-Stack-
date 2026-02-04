import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from '../../models/cart-item.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavController, ModalController, LoadingController } from '@ionic/angular';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-cart',
  template: `
    <app-header title="Tu Carrito" [backButton]="true">
        <ion-button (click)="goToCatalog()" fill="clear" color="light">
            <ion-icon name="arrow-back-circle-outline" slot="start"></ion-icon>
            Volver
        </ion-button>
    </app-header>

    <ion-content class="ion-padding" color="light">
      
      <div *ngIf="cartItems$ | async as items">
        
        <div *ngIf="items.length > 0; else emptyCart">
          <ion-list class="cart-list ion-no-padding">
            
            <ion-item-sliding *ngFor="let item of items" class="cart-item">
              <ion-item lines="none" class="item-inner">
                <ion-thumbnail slot="start" class="rounded-thumb">
                  <img [src]="item.product.imageUrl">
                </ion-thumbnail>
                
                <ion-label class="ion-text-wrap">
                  <div class="header-flex">
                      <h3 class="text-bold text-dark product-name">{{ item.product.name }}</h3>
                      <span class="text-bold text-dark item-price">{{ item.total | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  
                  <div class="stepper">
                    <ion-button size="small" fill="outline" color="medium" class="stepper-btn" (click)="updateQty(item.product.id, item.quantity - 1)">
                        <ion-icon name="remove" slot="icon-only"></ion-icon>
                    </ion-button>
                    <span class="qty-label">{{ item.quantity }}</span>
                    <ion-button size="small" fill="outline" color="medium" class="stepper-btn" (click)="updateQty(item.product.id, item.quantity + 1)">
                        <ion-icon name="add" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button size="small" fill="clear" color="danger" class="trash-btn" (click)="removeItem(item.product.id)">
                        <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </ion-label>
              </ion-item>

              <ion-item-options side="end">
                <ion-item-option color="danger" (click)="removeItem(item.product.id)">
                  <ion-icon name="trash" slot="icon-only"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>

          </ion-list>
        </div>

        <ng-template #emptyCart>
           <app-empty-state 
                title="Carrito vacío" 
                description="Aquí verás los productos que selecciones." 
                icon="cart-outline"
                actionText="Ir al catálogo"
                (action)="goToCatalog()">
           </app-empty-state>
        </ng-template>

      </div>
    </ion-content>

    <ion-footer *ngIf="(total$ | async) as total" class="ion-no-border shadow-card">
       <div *ngIf="total > 0" class="footer-container">
          
          <div class="order-summary">
             <div class="summary-row">
                <span>Subtotal (Base)</span>
                <span>{{ total / 1.19 | currency:'COP':'symbol':'1.0-0' }}</span>
             </div>
             <div class="summary-row">
                <span>IVA (19%)</span>
                <span>{{ total - (total / 1.19) | currency:'COP':'symbol':'1.0-0' }}</span>
             </div>
             <div class="summary-row">
                <span>Envío</span>
                <span class="free-badge">Gratis</span>
             </div>
          </div>

          <div class="divider"></div>

          <div class="total-row">
              <span class="text-medium text-muted">Total a pagar:</span>
              <span class="text-bold text-large">{{ total | currency:'COP':'symbol':'1.0-0' }}</span>
          </div>
          <ion-button expand="block" shape="round" color="success" class="checkout-btn" (click)="checkout()">
              FINALIZAR COMPRA
              <ion-icon name="arrow-forward" slot="end"></ion-icon>
          </ion-button>
       </div>
    </ion-footer>
  `,
  styles: [`
    .cart-list { background: transparent; }
    .cart-item {
        margin-bottom: 15px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        overflow: hidden;
    }
    .item-inner { --background: white; --inner-padding-end: 10px; }
    .rounded-thumb { --border-radius: 10px; }
    .text-dark { color: var(--ion-color-tertiary); }
    .text-bold { font-weight: 800; }
    
    .header-flex {
        display: flex;
        flex-wrap: wrap; /* Clave: permite que baje si no cabe */
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
    }
    .product-name {
        margin: 0;
        font-size: 14px;
        line-height: 1.25;
        flex: 1 1 140px; /* Crece, se encoge, base 140px */
    }
    .item-price {
        font-size: 15px;
        color: var(--ion-color-tertiary);
        white-space: nowrap; /* No rompe la línea del precio */
    }
    
    .stepper {
        display: flex;
        align-items: center;
        margin-top: 8px;
        gap: 5px;
    }
    .qty-label { font-weight: 600; min-width: 20px; text-align: center; font-size: 14px; }
    .stepper-btn { 
        height: 28px; 
        --padding-start: 4px; 
        --padding-end: 4px; 
        min-width: 32px;
        margin: 0;
    }
    .trash-btn {
        height: 28px;
        width: 30px;
        --padding-start: 0; 
        --padding-end: 0;
        margin-left: 5px;
    }
    
    .total-column { display: none; }
    
    .footer-container {
        background: white;
        padding: 12px 16px 20px; /* Reducido para compactar */
        box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
        border-radius: 20px 20px 0 0;
    }
    .order-summary { margin-bottom: 5px; }
    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
        font-size: 13px; /* Letra más pequeña */
        color: var(--ion-color-medium);
    }
    .free-badge { color: var(--ion-color-success); font-weight: 700; }
    .divider { height: 1px; background: #f0f0f0; margin: 8px 0 12px; }

    .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    .text-large { font-size: 1.3rem; color: var(--ion-color-tertiary); }
    .checkout-btn { height: 45px; --box-shadow: 0 8px 20px rgba(0, 184, 148, 0.3); font-weight: 700; letter-spacing: 0.5px; }
  `]
})
export class CartPage {
  cartItems$ = this.cartService.cart$;
  total$ = this.cartService.total$;

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private orderService: OrderService,
    private nav: NavController,
    private modalCtrl: ModalController,
    private notify: NotificationService,
    private loadingCtrl: LoadingController
  ) {}

  updateQty(productId: number, qty: number) {
      if (qty <= 0) {
          this.removeItem(productId);
      } else {
          this.cartService.updateQuantity(productId, qty);
      }
  }

  removeItem(id: number) {
      this.cartService.removeFromCart(id);
      this.notify.showWarning('Producto eliminado');
  }

  confirmClear() {
      // Implementar modal de confirmación aquí si se desea
      this.cartService.clearCart();
      this.notify.showInfo('Carrito vaciado');
  }

  goToCatalog() {
      this.nav.navigateBack('/catalog');
  }

  async checkout() {
      if (!this.auth.isAuthenticated()) {
          this.notify.showInfo('Debes iniciar sesión para finalizar tu compra');
          this.nav.navigateForward('/login');
          return;
      }
      
      const items = this.cartService.getCurrentValue();
      const total = items.reduce((acc, i) => acc + i.total, 0);

      const modal = await this.modalCtrl.create({
          component: ConfirmationModalComponent,
          componentProps: {
              title: 'Confirmar Pedido',
              message: '¿Estás seguro de que deseas procesar la compra?',
              total: total
          },
          cssClass: 'small-modal'
      });

      await modal.present();
      const { data } = await modal.onWillDismiss();

      if (data && data.confirmed) {
          this.processOrder();
      }
  }

  private async processOrder() {
      const loading = await this.loadingCtrl.create({
          message: 'Procesando tu pedido...',
          duration: 5000 // Timeout de seguridad 5s
      });
      await loading.present();

      const items = this.cartService.getCurrentValue();
      const total = items.reduce((acc, i) => acc + i.total, 0);
      
      const order: Order = {
          id: Date.now().toString(),
          items: items,
          total: total,
          date: new Date(),
          status: 'pending',
          userId: this.auth.currentUserValue?.uid || '1'
      };

      this.orderService.createOrder(order).subscribe({
        next: () => {
          loading.dismiss();
          this.cartService.clearCart();
          this.notify.showSuccess('¡Pedido realizado con éxito!');
          this.nav.navigateRoot('/confirm');
        },
        error: (err) => {
          loading.dismiss();
          console.error('Order creation failed', err);
          this.notify.showError('Hubo un problema al crear el pedido.');
        }
      });
  }
}
