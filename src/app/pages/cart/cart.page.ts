import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from '../../models/cart-item.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavController, ModalController } from '@ionic/angular';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-cart',
  template: `
    <app-header title="Tu Carrito" [backButton]="true">
        <ion-button (click)="confirmClear()" color="danger" *ngIf="(cartItems$ | async)?.length">
            <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
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
                
                <ion-label>
                  <h3 class="text-semibold text-dark">{{ item.product.name }}</h3>
                  <p class="price-text">{{ item.product.price | currency:'COP':'symbol':'1.0-0' }}</p>
                  
                  <div class="stepper">
                    <ion-button size="small" fill="outline" color="medium" (click)="updateQty(item.product.id, item.quantity - 1)">
                        <ion-icon name="remove" slot="icon-only"></ion-icon>
                    </ion-button>
                    <span class="qty-label">{{ item.quantity }}</span>
                    <ion-button size="small" fill="outline" color="medium" (click)="updateQty(item.product.id, item.quantity + 1)">
                        <ion-icon name="add" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </ion-label>
                
                <div slot="end" class="total-column">
                  <span class="text-bold text-dark">{{ item.total | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
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
    .price-text { color: var(--ion-color-primary); font-weight: 500; }
    
    .stepper {
        display: flex;
        align-items: center;
        margin-top: 8px;
        gap: 10px;
    }
    .qty-label { font-weight: 600; min-width: 20px; text-align: center; }
    
    .total-column {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        height: 100%;
    }
    
    .footer-container {
        background: white;
        padding: 20px 20px 30px; /* Safe area bottom */
        box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
        border-radius: 20px 20px 0 0;
    }
    .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    .text-large { font-size: 1.4rem; color: var(--ion-color-tertiary); }
    .checkout-btn { height: 50px; --box-shadow: 0 8px 20px rgba(0, 184, 148, 0.3); font-weight: 700; letter-spacing: 0.5px; }
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
    private notify: NotificationService
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
      
      const modal = await this.modalCtrl.create({
          component: ConfirmationModalComponent,
          componentProps: {
              title: 'Confirmar Pedido',
              message: '¿Estás seguro de que deseas procesar la compra?'
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
      const items = this.cartService.getCurrentValue();
      const total = items.reduce((acc, i) => acc + i.total, 0);
      
      const order: Order = {
          id: Date.now().toString(),
          items: items,
          total: total,
          date: new Date(),
          status: 'pending',
          userId: '1'
      };

      try {
          // Guardar primero localmente (Estrategia offline-first)
          await this.orderService.createOrder(order);
          this.cartService.clearCart();
          this.notify.showSuccess('¡Pedido realizado con éxito!');
          this.nav.navigateRoot('/confirm');
      } catch (e) {
          this.notify.showError('Hubo un problema al crear el pedido. Inténtalo de nuevo.');
      }
  }
}
