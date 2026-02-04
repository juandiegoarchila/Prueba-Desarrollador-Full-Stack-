import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-card class="product-card shadow-card mode-ios">
      <div class="image-wrapper">
        <ion-img [src]="product.imageUrl" [alt]="product.name"></ion-img>
        <div class="discount-badge" *ngIf="getDiscountPercent(product) as discount">
          -{{ discount }}%
        </div>
      </div>
      
      <ion-card-content>
        <div class="card-info">
            <h3 class="product-title text-semibold">{{ product.name }}</h3>
            <p class="product-desc text-small">{{ product.description }}</p>
        </div>

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
        
        <ion-button expand="block" shape="round" color="primary" 
           (click)="onAdd()" class="ion-no-margin add-btn">
          <ion-icon name="cart-outline" slot="start"></ion-icon>
          Agregar
        </ion-button>
      </ion-card-content>
    </ion-card>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();

  onAdd() {
    this.add.emit(this.product);
  }

  getDiscountPercent(product: Product): number | null {
    if (!product.previousPrice || product.previousPrice <= product.price) {
      return null;
    }
    const discount = Math.round((1 - product.price / product.previousPrice) * 100);
    return discount > 0 ? discount : null;
  }

  getStars(rating: number): string[] {
    const safeRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(safeRating);
    const hasHalf = safeRating - fullStars >= 0.5;
    const stars: string[] = [];

    for (let i = 0; i < fullStars; i += 1) {
      stars.push('star');
    }

    if (hasHalf) {
      stars.push('star-half');
    }

    while (stars.length < 5) {
      stars.push('star-outline');
    }

    return stars;
  }
}
