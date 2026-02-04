import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from 'src/environments/environment';

/**
 * Página principal del catálogo de productos.
 * 
 * Muestra la lista completa de productos disponibles en un grid responsivo.
 * 
 * **Características:**
 * - Grid responsivo (1 columna mobile, 2 tablet, 3 desktop)
 * - Badges animados que muestran cantidad de items en carrito y pedidos pendientes
 * - Estado de carga con spinner
 * - Estado vacío si no hay productos
 * - Botones de navegación a carrito, pedidos y logout
 * - Patrón takeUntil para prevenir memory leaks (CRÍTICO en esta página)
 * 
 * **Memory Leak Prevention:**
 * Esta página es especialmente propensa a memory leaks porque:
 * - Se subscribe a productService.getProducts()
 * - Observa cartCount$ (BehaviorSubject que emite continuamente)
 * - Observa pendingOrders$ (BehaviorSubject que emite continuamente)
 * - Sin takeUntil, estas subscripciones quedan activas después de navegar
 * 
 * **Flujo de carga:**
 * ```
 * ngOnInit()
 *     ↓
 * ProductService.getProducts()
 *     ↓
 * ├─ Éxito: Asignar products[], ocultar loading
 * └─ Error: Log solo en desarrollo, mostrar toast, ocultar loading
 * ```
 * 
 * **Observables en template:**
 * - cartCount$ | async: Cantidad de items en carrito (actualización automática)
 * - pendingOrders$ | async: Cantidad de pedidos pendientes de sincronización
 * 
 * @example
 * // Navegación a esta página (después del login)
 * this.navController.navigateRoot('/catalog');
 */

@Component({
  selector: 'app-catalog',
  template: `
    <app-header title="Catálogo">
        <ion-button routerLink="/orders" class="notification-btn">
            <ion-icon name="receipt-outline" slot="icon-only"></ion-icon>
            <span class="badge badge-orders" *ngIf="(pendingOrders$ | async) as count">{{ count > 0 ? count : '' }}</span>
        </ion-button>
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
        <ion-grid class="ion-no-padding catalog-grid" *ngIf="products.length > 0; else empty">
          <ion-row>
            <ion-col size="12" size-md="6" size-lg="4" *ngFor="let p of products">
              <app-product-card 
                [product]="p" 
                (add)="addToCart($event)">
              </app-product-card>
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
        z-index: 10;
        border: 2px solid var(--ion-color-primary);
    }
    .badge-orders {
        background: var(--ion-color-tertiary);
        animation: pulse-animation 2s infinite;
    }
    @keyframes pulse-animation {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
    }
    .centered-loader {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
    }
    ion-grid.catalog-grid {
      margin: 8px auto 16px;
      max-width: 1200px;
    }
    ion-row {
      margin-left: -12px;
      margin-right: -12px;
    }
    ion-col {
      padding: 12px;
    }
  `]
})
export class CatalogPage implements OnInit, OnDestroy {
  /** Array de productos cargados desde el servicio */
  products: Product[] = [];
  
  /** Flag para mostrar spinner de carga inicial */
  isLoading = true;
  
  /** 
   * Observable que emite la cantidad total de items en el carrito.
   * Se actualiza automáticamente cuando se agregan/eliminan productos.
   * Usado en el template con async pipe para mostrar badge.
   */
  cartCount$ = this.cartService.itemCount$;
  
  /**
   * Observable que emite la cantidad de pedidos pendientes de sincronización.
   * Se actualiza cuando se crean pedidos o cuando se sincronizan con Firebase.
   * Badge animado con pulse para llamar la atención.
   */
  pendingOrders$ = this.orderService.pendingCount$;

  /**
   * Subject para gestionar el ciclo de vida de las subscripciones.
   * CRÍTICO en esta página porque hay múltiples subscripciones activas.
   */
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService, 
    private cartService: CartService,
    private orderService: OrderService,
    private notify: NotificationService,
    private auth: AuthService,
    private nav: NavController
  ) {}

  /**
   * Hook de inicialización que carga los productos al entrar a la página.
   * 
   * **Flujo:**
   * 1. Llama a ProductService.getProducts()
   * 2. Si éxito:
   *    - Asigna productos al array
   *    - Oculta spinner (isLoading = false)
   * 3. Si error:
   *    - Log solo en desarrollo (no contaminar producción)
   *    - Muestra toast de error al usuario
   *    - Oculta spinner
   * 
   * **takeUntil(destroy$):**
   * Cancela la subscripción si el usuario navega antes de que carguen los productos.
   * Sin esto, la subscripción seguiría activa causando:
   * - Memory leak (subscripción huérfana en memoria)
   * - Posible error si intenta actualizar this.products después de destruir el componente
   */
  ngOnInit() {
    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$)) // Cancelar si el componente se destruye
      .subscribe({
        next: (data) => {
          // Productos cargados exitosamente
          this.products = data;
          this.isLoading = false;
        },
        error: (err) => {
          // Error cargando productos (archivo no encontrado, error de red, etc.)
          // Log solo en desarrollo, no contaminar consola en producción
          if (!environment.production) {
            console.error('Error cargando productos:', err);
          }
          this.isLoading = false;
          this.notify.showError('Error cargando productos');
        }
      });
  }

  /**
   * Agrega un producto al carrito y muestra notificación.
   * 
   * **Flujo:**
   * 1. CartService.addToCart() actualiza el BehaviorSubject interno
   * 2. cart$ y itemCount$ emiten nuevos valores automáticamente
   * 3. El badge en el header se actualiza reactivamente (async pipe)
   * 4. Muestra toast confirmando la acción
   * 
   * @param product - Producto a agregar (viene del evento emitido por app-product-card)
   * 
   * @example
   * // En el template
   * <app-product-card [product]="p" (add)="addToCart($event)"></app-product-card>
   * 
   * // El componente app-product-card emite:
   * this.add.emit(this.product);
   */
  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.notify.showSuccess(`Agregaste ${product.name} al carrito`);
  }

  /**
   * Cierra la sesión del usuario y navega al login.
   * 
   * **Flujo:**
   * 1. AuthService.logout() elimina el usuario de Storage
   * 2. currentUser$ emite null
   * 3. Muestra toast informativo
   * 4. Navega a /login (navigateRoot resetea el stack)
   * 
   * **navigateRoot:**
   * Limpia el historial de navegación para que el usuario
   * no pueda volver al catálogo con el botón "atrás".
   */
  async logout() {
      await this.auth.logout();
      this.notify.showInfo('Has cerrado sesión correctamente');
      this.nav.navigateRoot('/login');
  }

  /**
   * Hook de destrucción que limpia las subscripciones.
   * 
   * **CRÍTICO:**
   * Sin este cleanup, las subscripciones de:
   * - productService.getProducts()
   * - cartCount$ (si se usa en lógica, no solo en template)
   * - pendingOrders$ (si se usa en lógica)
   * 
   * Quedarían activas causando memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

