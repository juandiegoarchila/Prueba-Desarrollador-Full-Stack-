import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';
import { getStars } from '../../shared/utils/rating.util';
import { getDiscountPercent } from '../../shared/utils/price.util';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  template: `
    <app-header title="Detalle" [backButton]="true"></app-header>

    <ion-content class="ion-padding" color="light">
      <div *ngIf="isLoading" class="centered-loader">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="text-medium ion-margin-top">Cargando producto...</p>
      </div>

      <div *ngIf="!isLoading && product" class="detail-container">
        <ion-card class="detail-card">
          <div class="detail-image">
            <ion-img [src]="product.imageUrl" [alt]="product.name"></ion-img>
            <div class="discount-badge" *ngIf="discountPercent">
              -{{ discountPercent }}%
            </div>
          </div>

          <ion-card-content>
            <h2 class="detail-title">{{ product.name }}</h2>

            <div class="price-row">
              <span class="current-price">{{ product.price | currency:'COP':'symbol':'1.0-0' }}</span>
              <span class="previous-price" *ngIf="product.previousPrice">
                {{ product.previousPrice | currency:'COP':'symbol':'1.0-0' }}
              </span>
            </div>

            <div class="rating-row" *ngIf="product.rating">
              <ion-icon
                *ngFor="let star of getStars(product.rating)"
                [name]="star"
                class="rating-star">
              </ion-icon>
              <span class="rating-value">{{ product.rating | number:'1.1-1' }}</span>
            </div>

            <p class="detail-description">{{ product.description }}</p>

            <ion-button expand="block" shape="round" color="primary" class="add-btn" (click)="addToCart()">
              <ion-icon name="cart-outline" slot="start"></ion-icon>
              Agregar al carrito
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <div *ngIf="!isLoading && !product">
        <app-empty-state
          title="Producto no encontrado"
          description="No fue posible cargar el detalle del producto."
          icon="alert-circle-outline">
        </app-empty-state>
      </div>
    </ion-content>
  `,
  styles: [`
    .centered-loader {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }
    .detail-container {
      max-width: 720px;
      margin: 0 auto;
    }
    .detail-card {
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 12px 28px rgba(17, 24, 39, 0.12);
    }
    .detail-image {
      position: relative;
      background: #ffffff;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
    }
    .detail-image ion-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .discount-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: var(--ion-color-danger);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
    .detail-title {
      margin: 0 0 10px;
      font-size: 1.4rem;
      color: var(--ion-color-tertiary);
      font-weight: 700;
    }
    .price-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--ion-color-tertiary);
    }
    .previous-price {
      font-size: 1rem;
      color: #7a8699;
      text-decoration: line-through;
      text-decoration-thickness: 2px;
    }
    .rating-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 14px;
    }
    .rating-star {
      font-size: 18px;
      color: #f1c40f;
    }
    .rating-value {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
      font-weight: 600;
    }
    .detail-description {
      color: var(--ion-color-medium);
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .add-btn {
      height: 48px;
      font-weight: 700;
      --box-shadow: 0 10px 20px rgba(108, 92, 231, 0.25);
    }
  `]
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  isLoading = true;
  discountPercent: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notify: NotificationService,
    private nav: NavController
  ) {}

  getStars = getStars;

  ngOnInit() {
    const productId = Number(this.route.snapshot.paramMap.get('id'));

    if (!productId) {
      this.isLoading = false;
      return;
    }

    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.discountPercent = product
          ? getDiscountPercent(product.price, product.previousPrice)
          : null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  addToCart() {
    if (!this.product) {
      return;
    }
    this.cartService.addToCart(this.product);
    this.notify.showSuccess(`Agregaste ${this.product.name} al carrito`);
    this.nav.navigateForward('/cart');
  }
}
