import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../../models/cart-item.model';
import { Product } from '../../models/product.model';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartItems.asObservable();
  
  public total$ = this.cart$.pipe(
    map(items => items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0))
  );

  public itemCount$ = this.cart$.pipe(
    map(items => items.reduce((acc, item) => acc + item.quantity, 0))
  );

  constructor(private storage: StorageService) {
      this.loadCart();
  }

  private async loadCart() {
      const items = await this.storage.get('cart');
      if (items) {
          this.cartItems.next(items);
      }
  }

  private saveCart(items: CartItem[]) {
      this.cartItems.next(items);
      this.storage.set('cart', items);
  }

  addToCart(product: Product, quantity: number = 1) {
      const currentItems = [...this.cartItems.value];
      const existingItemIndex = currentItems.findIndex(i => i.product.id === product.id);

      if (existingItemIndex > -1) {
          const item = currentItems[existingItemIndex];
          item.quantity += quantity;
          item.total = item.quantity * item.product.price;
          currentItems[existingItemIndex] = item;
      } else {
          currentItems.push({
              product,
              quantity,
              total: product.price * quantity
          });
      }
      this.saveCart(currentItems);
  }

  updateQuantity(productId: number, quantity: number) {
      const currentItems = [...this.cartItems.value];
      const index = currentItems.findIndex(i => i.product.id === productId);

      if (index > -1) {
          if (quantity > 0) {
              currentItems[index].quantity = quantity;
              currentItems[index].total = quantity * currentItems[index].product.price;
              this.saveCart(currentItems);
          } else {
              this.removeFromCart(productId);
          }
      }
  }

  removeFromCart(productId: number) {
      const currentItems = this.cartItems.value.filter(i => i.product.id !== productId);
      this.saveCart(currentItems);
  }

  clearCart() {
      this.saveCart([]);
  }

  getCurrentValue(): CartItem[] {
      return this.cartItems.value;
  }
}

