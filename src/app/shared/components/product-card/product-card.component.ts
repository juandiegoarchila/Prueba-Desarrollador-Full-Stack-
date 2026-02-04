import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-card class="product-card shadow-card mode-ios">
      <div class="image-wrapper">
        <img [src]="product.imageUrl" [alt]="product.name" loading="lazy" />
        <div class="price-badge">
           {{ product.price | currency:'COP':'symbol':'1.0-0' }}
        </div>
      </div>
      
      <ion-card-content>
        <div class="card-info">
            <h3 class="product-title text-semibold">{{ product.name }}</h3>
            <p class="product-desc text-small">{{ product.description }}</p>
        </div>
        
        <ion-button expand="block" shape="round" color="primary" 
           (click)="onAdd()" class="ion-no-margin add-btn">
          <ion-icon name="cart-outline" slot="start"></ion-icon>
          Agregar
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
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
    img {
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
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();

  onAdd() {
    this.add.emit(this.product);
  }
}
