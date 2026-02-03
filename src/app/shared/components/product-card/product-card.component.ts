import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  template: `
    <ion-card>
      <img [src]="product.imageUrl" [alt]="product.name" />
      <ion-card-header>
        <ion-card-subtitle>{{ product.price | currency:'COP':'symbol':'1.0-0' }}</ion-card-subtitle>
        <ion-card-title>{{ product.name }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        {{ product.description }}
        <ion-button expand="block" (click)="add.emit(product)" class="ion-margin-top">
          Agregar al Carrito
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    ion-card {
      margin-bottom: 20px;
    }
    img {
      height: 200px;
      width: 100%;
      object-fit: cover;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();
}
