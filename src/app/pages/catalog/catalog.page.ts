import { Component, OnInit } from '@angular/core';
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
      
      <div *ngIf="isLoading" class="centered-loader">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="text-medium ion-margin-top">Cargando catálogo...</p>
      </div>

      <div *ngIf="!isLoading">
        <ion-grid class="ion-no-padding" *ngIf="products.length > 0; else empty">
          <ion-row>
            <ion-col size="12" size-md="6" size-lg="4" *ngFor="let p of products">
              <ion-card class="product-card shadow-card mode-ios">
                <div class="image-wrapper">
                  <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
                  <div class="price-badge">
                    {{ p.price | currency:'COP':'symbol':'1.0-0' }}
                  </div>
                </div>

                <ion-card-content>
                  <div class="card-info">
                    <h3 class="product-title text-semibold">{{ p.name }}</h3>
                    <p class="product-desc text-small">{{ p.description }}</p>
                  </div>

                  <ion-button expand="block" shape="round" color="primary" 
                    (click)="addToCart(p)" class="ion-no-margin add-btn">
                    <ion-icon name="cart-outline" slot="start"></ion-icon>
                    Agregar
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ng-template #empty>
          <app-empty-state 
              title="Sin Productos" 
              description="No hay productos disponibles en este momento." 
              icon="cube-outline">
          </app-empty-state>
        </ng-template>
      </div>

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
    .product-card {
      background: white;
      margin: 0 0 20px 0;
      border-radius: 16px;
      overflow: visible;
    }
    .image-wrapper {
      position: relative;
      border-radius: 16px 16px 0 0;
      overflow: hidden;
      height: 180px;
    }
    .image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .price-badge {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.95);
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 700;
      color: var(--ion-color-tertiary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-size: 0.9rem;
    }
    ion-card-content {
      padding: 16px;
    }
    .card-info {
      min-height: 80px;
    }
    .product-title {
      font-size: 1.1rem;
      color: var(--ion-color-tertiary);
      margin: 0 0 4px;
    }
    .product-desc {
      color: var(--ion-color-medium);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0 0 16px;
      line-height: 1.4;
    }
    .add-btn {
      --box-shadow: none;
      height: 44px;
      font-weight: 600;
    }
  `]
})
export class CatalogPage implements OnInit {
  products: Product[] = [];
  isLoading = true;
  cartCount$ = this.cartService.itemCount$; 

  constructor(
    private productService: ProductService, 
    private cartService: CartService,
    private notify: NotificationService,
    private auth: AuthService,
    private nav: NavController
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.notify.showError('Error cargando productos');
      }
    });
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

