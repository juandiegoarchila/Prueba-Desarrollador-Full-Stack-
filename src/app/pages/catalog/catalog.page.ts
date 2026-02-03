import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-catalog',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Catálogo</ion-title>
        <ion-buttons slot="end">
            <ion-button routerLink="/cart">
                <ion-icon name="cart" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-button (click)="logout()" *ngIf="isLoggedIn$ | async">
                <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-button routerLink="/login" *ngIf="(isLoggedIn$ | async) === false">
                <ion-icon name="person-circle-outline" slot="icon-only"></ion-icon>
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="products$ | async as products; else loading">
        <app-product-card 
            *ngFor="let p of products" 
            [product]="p" 
            (add)="addToCart($event)">
        </app-product-card>
      </div>
      <ng-template #loading>
        <ion-spinner></ion-spinner>
      </ng-template>
    </ion-content>
  `
})
export class CatalogPage implements OnInit {
  products$!: Observable<Product[]>;
  isLoggedIn$ = this.auth.currentUser$;

  constructor(
    private productService: ProductService, 
    private cartService: CartService,
    private notify: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.products$ = this.productService.getProducts();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.notify.showInfo(`Agregado: ${product.name}`);
  }

  logout() {
      this.auth.logout();
      this.notify.showInfo('Sesión cerrada');
  }
}
