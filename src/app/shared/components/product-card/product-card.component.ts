import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-card class="product-card shadow-card mode-ios">
      <div class="image-wrapper">
        <ion-img [src]="product.imageUrl" [alt]="product.name"></ion-img>
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
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();

  onAdd() {
    this.add.emit(this.product);
  }
}
