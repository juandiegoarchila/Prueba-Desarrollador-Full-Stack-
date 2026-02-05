import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../../models/cart-item.model';
import { Product } from '../../models/product.model';
import { StorageService } from '../storage/storage.service';
import { AuthService } from './auth.service';

/**
 * Servicio de gestión del carrito de compras.
 * 
 * Utiliza el patrón BehaviorSubject de RxJS para mantener un estado reactivo
 * del carrito que se sincroniza automáticamente con la UI a través de observables.
 * 
 * **Características principales:**
 * - Estado reactivo con BehaviorSubject (permite acceso síncrono + subscripciones)
 * - Persistencia automática en Storage AISLADA POR USUARIO (cada usuario tiene su carrito)
 * - Cálculo automático de totales y cantidad de items con operadores RxJS
 * - Gestión de cantidades con validación (no permite cantidades negativas)
 * 
 * **Flujo de datos:**
 * ```
 * cartItems (BehaviorSubject) → cart$ (Observable) → UI
 *                             → total$ (Observable calculado)
 *                             → itemCount$ (Observable calculado)
 * ```
 * 
 * @example
 * // En el componente
 * constructor(private cartService: CartService) {}
 * 
 * // Agregar producto
 * addToCart(product: Product) {
 *   this.cartService.addToCart(product, 1);
 * }
 * 
 * // Observar cambios del carrito
 * this.cartService.cart$.subscribe(items => {
 *   console.log('Items en carrito:', items);
 * });
 * 
 * // Mostrar total en el template
 * <ion-text>Total: {{ (cartService.total$ | async) | currency }}</ion-text>
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  /**
   * BehaviorSubject privado que mantiene el estado del carrito.
   * BehaviorSubject se usa porque:
   * - Emite el último valor inmediatamente al subscribirse (útil para UI)
   * - Permite acceso síncrono con .value
   * - Es multicast (múltiples subscriptores comparten la misma fuente)
   */
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  /**
   * Observable público del carrito para subscripciones en componentes.
   * Usar este observable en lugar del BehaviorSubject directamente
   * previene mutaciones no controladas desde fuera del servicio.
   */
  public cart$ = this.cartItems.asObservable();
  
  /**
   * Observable derivado que calcula el total del carrito en tiempo real.
   * Usa el operador map() para transformar el array de items en un número.
   * Se recalcula automáticamente cada vez que cambia el carrito.
   * 
   * @example
   * <ion-text>Total: {{ (cartService.total$ | async) | currency:'COP' }}</ion-text>
   */
  public total$ = this.cart$.pipe(
    map(items => items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0))
  );

  /**
   * Observable derivado que cuenta el total de items (sumando cantidades).
   * Útil para mostrar el badge del carrito en la UI.
   * 
   * @example
   * <ion-badge>{{ cartService.itemCount$ | async }}</ion-badge>
   */
  public itemCount$ = this.cart$.pipe(
    map(items => items.reduce((acc, item) => acc + item.quantity, 0))
  );

  /**
   * Email del usuario actual para construir claves de storage aisladas.
   * Se actualiza cada vez que cambia el usuario autenticado.
   */
  private currentUserEmail: string | null = null;

  constructor(
    private storage: StorageService,
    private authService: AuthService
  ) {
    // Suscribirse a cambios de usuario para cargar el carrito correspondiente
    this.authService.currentUser$.subscribe(user => {
      if (user && user.email) {
        this.currentUserEmail = user.email;
        this.loadCart();
      } else {
        // Usuario deslogueado: limpiar carrito de la memoria
        this.currentUserEmail = null;
        this.cartItems.next([]);
      }
    });
  }

  /**
   * Genera la clave de storage específica para el usuario actual.
   * Formato: 'cart_usuario@email.com'
   * Esto asegura que cada usuario tenga su propio carrito aislado.
   */
  private getCartKey(): string {
    return this.currentUserEmail ? `cart_${this.currentUserEmail}` : 'cart_guest';
  }

  /**
   * Carga el carrito desde Storage usando la clave específica del usuario.
   * Se ejecuta automáticamente cuando cambia el usuario autenticado.
   * Si no hay datos guardados, el carrito queda vacío.
   */
  private async loadCart() {
    const key = this.getCartKey();
    const items = await this.storage.get(key);
    // Type guard: verificar que sea un array antes de usarlo
    if (items && Array.isArray(items)) {
      this.cartItems.next(items as CartItem[]);
    } else {
      // Si no hay carrito guardado, iniciar vacío
      this.cartItems.next([]);
    }
  }

  /**
   * Guarda el carrito en Storage usando la clave específica del usuario y actualiza el BehaviorSubject.
   * Este método centraliza la persistencia para evitar inconsistencias.
   * 
   * @param items - Array de items del carrito a guardar
   */
  private saveCart(items: CartItem[]) {
    const key = this.getCartKey();
    this.cartItems.next(items);
    this.storage.set(key, items);
  }

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe.
   * 
   * **Lógica:**
   * 1. Si el producto ya está en el carrito → incrementa cantidad
   * 2. Si es nuevo → lo agrega como nuevo item
   * 3. Recalcula el total del item
   * 4. Persiste en Storage automáticamente
   * 
   * @param product - Producto a agregar
   * @param quantity - Cantidad a agregar (default: 1)
   * 
   * @example
   * this.cartService.addToCart(product, 2);
   */
  addToCart(product: Product, quantity: number = 1) {
      // Clonar el array para evitar mutaciones directas
      const currentItems = [...this.cartItems.value];
      const existingItemIndex = currentItems.findIndex(i => i.product.id === product.id);

      if (existingItemIndex > -1) {
          // Producto ya existe: incrementar cantidad
          const item = currentItems[existingItemIndex];
          item.quantity += quantity;
          item.total = item.quantity * item.product.price;
          currentItems[existingItemIndex] = item;
      } else {
          // Producto nuevo: agregarlo al array
          currentItems.push({
              product,
              quantity,
              total: product.price * quantity
          });
      }
      this.saveCart(currentItems);
  }

  /**
   * Actualiza la cantidad de un producto específico en el carrito.
   * 
   * **Validaciones:**
   * - Si quantity > 0 → actualiza la cantidad
   * - Si quantity <= 0 → elimina el producto del carrito
   * 
   * @param productId - ID del producto a actualizar
   * @param quantity - Nueva cantidad (si es 0 o negativo, elimina el producto)
   * 
   * @example
   * // Cambiar cantidad a 3
   * this.cartService.updateQuantity(1, 3);
   * 
   * // Eliminar producto (cantidad 0)
   * this.cartService.updateQuantity(1, 0);
   */
  updateQuantity(productId: number, quantity: number) {
      const currentItems = [...this.cartItems.value];
      const index = currentItems.findIndex(i => i.product.id === productId);

      if (index > -1) {
          if (quantity > 0) {
              // Actualizar cantidad y recalcular total
              currentItems[index].quantity = quantity;
              currentItems[index].total = quantity * currentItems[index].product.price;
              this.saveCart(currentItems);
          } else {
              // Cantidad <= 0: eliminar el producto
              this.removeFromCart(productId);
          }
      }
  }

  /**
   * Elimina un producto del carrito por su ID.
   * 
   * @param productId - ID del producto a eliminar
   * 
   * @example
   * this.cartService.removeFromCart(1);
   */
  removeFromCart(productId: number) {
      // Filtrar todos los items excepto el que queremos eliminar
      const currentItems = this.cartItems.value.filter(i => i.product.id !== productId);
      this.saveCart(currentItems);
  }

  /**
   * Vacía completamente el carrito.
   * Útil después de confirmar un pedido.
   * 
   * @example
   * // Después de crear el pedido exitosamente
   * this.orderService.createOrder(order).subscribe(() => {
   *   this.cartService.clearCart();
   * });
   */
  clearCart() {
      this.saveCart([]);
  }

  /**
   * Obtiene el valor actual del carrito de forma síncrona.
   * Útil cuando necesitas el valor inmediato sin subscribirte.
   * 
   * **Nota:** Preferir cart$ observable para UI reactiva.
   * 
   * @returns Array de items del carrito en este momento
   * 
   * @example
   * const items = this.cartService.getCurrentValue();
   * console.log('Items actuales:', items.length);
   */
  getCurrentValue(): CartItem[] {
      return this.cartItems.value;
  }
}

