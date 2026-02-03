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
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/catalog"></ion-back-button>
        </ion-buttons>
        <ion-title>Carrito</ion-title>
        <ion-buttons slot="end">
            <ion-button (click)="clearCart()" color="danger">
                <ion-icon name="trash" slot="icon-only"></ion-icon>
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list *ngIf="(cartItems$ | async)?.length as count; else empty">
        <ion-item *ngFor="let item of (cartItems$ | async)">
          <ion-thumbnail slot="start">
            <img [src]="item.product.imageUrl">
          </ion-thumbnail>
          <ion-label>
            <h2>{{ item.product.name }}</h2>
            <p>{{ item.product.price | currency:'COP':'symbol':'1.0-0' }} x {{ item.quantity }}</p>
          </ion-label>
          <ion-note slot="end">
            {{ item.total | currency:'COP':'symbol':'1.0-0' }}
          </ion-note>
          <ion-button fill="clear" color="danger" slot="end" (click)="removeItem(item.product.id)">
            <ion-icon name="close-circle"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <ng-template #empty>
        <div class="ion-text-center ion-padding">
          <h3>Tu carrito está vacío</h3>
          <ion-button routerLink="/catalog" fill="outline">Ir al catálogo</ion-button>
        </div>
      </ng-template>
    </ion-content>

    <ion-footer *ngIf="(cartItems$ | async)?.length">
      <ion-toolbar>
        <ion-title slot="start">Total: {{ total | currency:'COP':'symbol':'1.0-0' }}</ion-title>
        <ion-button slot="end" (click)="checkout()" color="success" class="ion-margin-end">
          Finalizar Compra
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `
})
export class CartPage implements OnInit {
  cartItems$: Observable<CartItem[]>;
  total: number = 0;

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private orderService: OrderService,
    private nav: NavController,
    private modalCtrl: ModalController,
    private notify: NotificationService
  ) {
      this.cartItems$ = this.cartService.cart$;
  }

  ngOnInit() {
      this.cartItems$.subscribe(() => {
          this.total = this.cartService.getTotal();
      });
  }

  removeItem(id: number) {
      this.cartService.removeFromCart(id);
  }

  clearCart() {
      this.cartService.clearCart();
  }

  async checkout() {
      if (!this.auth.isAuthenticated()) {
          this.notify.showInfo('Debes iniciar sesión para comprar');
          this.nav.navigateForward('/login');
          return;
      }

      const modal = await this.modalCtrl.create({
          component: ConfirmationModalComponent,
          componentProps: {
              title: 'Confirmar Pedido',
              message: `¿Deseas realizar la compra por un total de ${this.total}?`
          }
      });

      await modal.present();
      const { data, role } = await modal.onWillDismiss();

      if (role === 'confirm') {
          this.processOrder();
      }
  }

  private processOrder() {
      this.auth.currentUser$.subscribe(user => {
          if (!user) return; // Should not happen due to check above

          const order: Order = {
              id: new Date().getTime().toString(),
              userId: user.uid,
              items: this.cartService.getItems(),
              total: this.total,
              date: new Date(),
              status: 'pending'
          };

          this.orderService.createOrder(order).subscribe({
              next: () => {
                  this.cartService.clearCart();
                  this.nav.navigateRoot('/confirm');
              },
              error: (err) => {
                  this.notify.showError('Error al crear pedido: ' + err);
              }
          });
      });
  }
}
