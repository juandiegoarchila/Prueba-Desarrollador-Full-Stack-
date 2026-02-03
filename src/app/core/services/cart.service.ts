import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../../models/cart-item.model';
import { Product } from '../../models/product.model';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartItems.asObservable();

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
      const currentItems = this.cartItems.value;
      const existingItem = currentItems.find(i => i.product.id === product.id);

      if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.total = existingItem.quantity * existingItem.product.price;
      } else {
          currentItems.push({
              product,
              quantity,
              total: product.price * quantity
          });
      }
      this.saveCart([...currentItems]);
  }

  removeFromCart(productId: number) {
      const currentItems = this.cartItems.value.filter(i => i.product.id !== productId);
      this.saveCart(currentItems);
  }

  clearCart() {
      this.saveCart([]);
  }

  getTotal(): number {
      return this.cartItems.value.reduce((acc, item) => acc + item.total, 0);
  }

  getItems(): CartItem[] {
      return this.cartItems.value;
  }
}
