import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-catalog',
  template: `
    <app-header title="Catálogo">
        <ion-button routerLink="/cart" class="notification-btn">
            <ion-icon name="cart-outline" slot="icon-only"></ion-icon>
            <span class="badge" *ngIf="(cartCount$ | async) as count">{{ count > 0 ? count : '' }}</span>
        </ion-button>
        <ion-button (click)="logout()">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
        </ion-button>
    </app-header>

    <ion-content class="ion-padding" color="light">
      
      <div *ngIf="products$ | async as products; else loading">
        
        <div *ngIf="products.length > 0; else empty">
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="12" size-md="6" size-lg="4" *ngFor="let p of products">
                 <app-product-card 
                    [product]="p" 
                    (add)="addToCart($event)">
                 </app-product-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <ng-template #empty>
            <app-empty-state 
                title="Sin Productos" 
                description="No hay productos disponibles en este momento." 
                icon="cube-outline">
            </app-empty-state>
        </ng-template>

      </div>

      <ng-template #loading>
        <div class="centered-loader">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
            <p class="text-medium ion-margin-top">Cargando catálogo...</p>
        </div>
      </ng-template>

    </ion-content>
  `,
  styles: [`
    .notification-btn {
        position: relative;
    }
    .badge {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--ion-color-danger);
        color: white;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .centered-loader {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
    }
  `]
})
export class CatalogPage implements OnInit {
  products$!: Observable<Product[]>;
  cartCount$ = this.cartService.itemCount$; 

  constructor(
    private productService: ProductService, 
    private cartService: CartService,
    private notify: NotificationService,
    private auth: AuthService,
    private nav: NavController
  ) {}

  ngOnInit() {
    this.products$ = this.productService.getProducts();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.notify.showSuccess(`Agregaste ${product.name} al carrito`);
  }

  async logout() {
      await this.auth.logout();
      this.notify.showInfo('Has cerrado sesión correctamente');
      this.nav.navigateRoot('/login');
  }
}

