import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartItem } from '../../models/cart-item.model';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavController, ModalController, LoadingController } from '@ionic/angular';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { Order } from '../../models/order.model';
import { environment } from 'src/environments/environment';

/**
 * Página del carrito de compras.
 * 
 * Muestra los items agregados al carrito con opciones para ajustar cantidades,
 * eliminar productos, y proceder al checkout.
 * 
 * **Características:**
 * - Lista interactiva de productos con stepper de cantidad (+/-)
 * - Cálculo automático de subtotal, IVA y total
 * - Swipe-to-delete en items individuales
 * - Modal de confirmación antes de procesar pedido
 * - Integración con OrderService (Offline-First)
 * - Loading spinner durante la creación del pedido
 * - Navegación automática a página de confirmación después del checkout
 * 
 * **Cálculo de totales:**
 * ```
 * Subtotal = Suma de (precio * cantidad) de todos los items
 * IVA (19%) = Subtotal * 0.19
 * Total = Subtotal + IVA
 * ```
 * 
 * **Flujo de checkout:**
 * ```
 * Usuario hace clic en "Proceder al Checkout"
 *     ↓
 * Verificar autenticación
 *     ↓ (si no autenticado)
 *     └─> Redirigir a /login
 *     ↓ (si autenticado)
 * Mostrar modal de confirmación con total
 *     ↓ (si confirma)
 * Crear Order con OrderService (Offline-First)
 *     ↓
 * ├─ Guardar en LocalStorage (siempre éxito)
 * ├─ Intentar sync con Firebase (segundo plano)
 * ├─ Vaciar carrito
 * ├─ Mostrar toast "Pedido realizado"
 * └─ Navegar a /confirm (página de confirmación)
 * ```
 * 
 * **Memory leak prevention:**
 * - Implementa OnDestroy
 * - Usa takeUntil(destroy$) en processOrder()
 * - Observables del template (async pipe) se limpian automáticamente
 * 
 * @example
 * // Navegación desde catálogo
 * <ion-button routerLink="/cart">
 *   <ion-icon name="cart-outline"></ion-icon>
 *   <span>{{ cartCount$ | async }}</span>
 * </ion-button>
 */

@Component({
  selector: 'app-cart',
  template: `
    <app-header title="Tu Carrito" [backButton]="true">
        <ion-button (click)="goToCatalog()" fill="clear" color="light">
            <ion-icon name="arrow-back-circle-outline" slot="start"></ion-icon>
            Volver
        </ion-button>
    </app-header>

    <ion-content class="ion-padding" color="light">
      
      <div *ngIf="cartItems$ | async as items">
        
        <div *ngIf="items.length > 0; else emptyCart">
          <ion-list class="cart-list ion-no-padding">
            
            <ion-item-sliding *ngFor="let item of items" class="cart-item">
              <ion-item lines="none" class="item-inner">
                <ion-thumbnail slot="start" class="rounded-thumb">
                  <img [src]="item.product.imageUrl">
                </ion-thumbnail>
                
                <ion-label class="ion-text-wrap">
                  <div class="header-flex">
                      <h3 class="text-bold text-dark product-name">{{ item.product.name }}</h3>
                      <span class="text-bold text-dark item-price">{{ item.total | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  
                  <div class="stepper">
                    <ion-button size="small" fill="outline" color="medium" class="stepper-btn" (click)="updateQty(item.product.id, item.quantity - 1)">
                        <ion-icon name="remove" slot="icon-only"></ion-icon>
                    </ion-button>
                    <span class="qty-label">{{ item.quantity }}</span>
                    <ion-button size="small" fill="outline" color="medium" class="stepper-btn" (click)="updateQty(item.product.id, item.quantity + 1)">
                        <ion-icon name="add" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button size="small" fill="clear" color="danger" class="trash-btn" (click)="removeItem(item.product.id)">
                        <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </ion-label>
              </ion-item>

              <ion-item-options side="end">
                <ion-item-option color="danger" (click)="removeItem(item.product.id)">
                  <ion-icon name="trash" slot="icon-only"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>

          </ion-list>
        </div>

        <ng-template #emptyCart>
           <app-empty-state 
                title="Carrito vacío" 
                description="Aquí verás los productos que selecciones." 
                icon="cart-outline"
                actionText="Ir al catálogo"
                (action)="goToCatalog()">
           </app-empty-state>
        </ng-template>

      </div>
    </ion-content>

    <ion-footer *ngIf="(total$ | async) as total" class="ion-no-border shadow-card">
       <div *ngIf="total > 0" class="footer-container">
          
          <div class="order-summary">
             <div class="summary-row">
                <span>Subtotal (Base)</span>
                <span>{{ total / 1.19 | currency:'COP':'symbol':'1.0-0' }}</span>
             </div>
             <div class="summary-row">
                <span>IVA (19%)</span>
                <span>{{ total - (total / 1.19) | currency:'COP':'symbol':'1.0-0' }}</span>
             </div>
             <div class="summary-row">
                <span>Envío</span>
                <span class="free-badge">Gratis</span>
             </div>
          </div>

          <div class="divider"></div>

          <div class="total-row">
              <span class="text-medium text-muted">Total a pagar:</span>
              <span class="text-bold text-large">{{ total | currency:'COP':'symbol':'1.0-0' }}</span>
          </div>
          <ion-button expand="block" shape="round" color="success" class="checkout-btn" (click)="checkout()">
              FINALIZAR COMPRA
              <ion-icon name="arrow-forward" slot="end"></ion-icon>
          </ion-button>
       </div>
    </ion-footer>
  `,
  styles: [`
    .cart-list { background: transparent; }
    .cart-item {
        margin-bottom: 15px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        overflow: hidden;
    }
    .item-inner { --background: white; --inner-padding-end: 10px; }
    .rounded-thumb { --border-radius: 10px; }
    .text-dark { color: var(--ion-color-tertiary); }
    .text-bold { font-weight: 800; }
    
    .header-flex {
        display: flex;
        flex-wrap: wrap; /* Clave: permite que baje si no cabe */
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
    }
    .product-name {
        margin: 0;
        font-size: 14px;
        line-height: 1.25;
        flex: 1 1 140px; /* Crece, se encoge, base 140px */
    }
    .item-price {
        font-size: 15px;
        color: var(--ion-color-tertiary);
        white-space: nowrap; /* No rompe la línea del precio */
    }
    
    .stepper {
        display: flex;
        align-items: center;
        margin-top: 8px;
        gap: 5px;
    }
    .qty-label { font-weight: 600; min-width: 20px; text-align: center; font-size: 14px; }
    .stepper-btn { 
        height: 28px; 
        --padding-start: 4px; 
        --padding-end: 4px; 
        min-width: 32px;
        margin: 0;
    }
    .trash-btn {
        height: 28px;
        width: 30px;
        --padding-start: 0; 
        --padding-end: 0;
        margin-left: 5px;
    }
    
    .total-column { display: none; }
    
    .footer-container {
        background: white;
        padding: 12px 16px 20px; /* Reducido para compactar */
        box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
        border-radius: 20px 20px 0 0;
    }
    .order-summary { margin-bottom: 5px; }
    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
        font-size: 13px; /* Letra más pequeña */
        color: var(--ion-color-medium);
    }
    .free-badge { color: var(--ion-color-success); font-weight: 700; }
    .divider { height: 1px; background: #f0f0f0; margin: 8px 0 12px; }

    .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    .text-large { font-size: 1.3rem; color: var(--ion-color-tertiary); }
    .checkout-btn { height: 45px; --box-shadow: 0 8px 20px rgba(0, 184, 148, 0.3); font-weight: 700; letter-spacing: 0.5px; }
  `]
})
export class CartPage implements OnDestroy {
  /**
   * Observable que emite la lista de items del carrito.
   * Se actualiza automáticamente cuando se agregan/eliminan productos.
   * Usado con async pipe en el template para rendering reactivo.
   */
  cartItems$ = this.cartService.cart$;
  
  /**
   * Observable que emite el total del carrito (suma de todos los items).
   * Cálculo automático realizado por CartService con operador map().
   * Usado para mostrar el total general en la UI.
   */
  total$ = this.cartService.total$;

  /**
   * Subject para gestionar el ciclo de vida de las subscripciones.
   * Previene memory leaks en processOrder().
   */
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private orderService: OrderService,
    private nav: NavController,
    private modalCtrl: ModalController,
    private notify: NotificationService,
    private loadingCtrl: LoadingController
  ) {}

  /**
   * Actualiza la cantidad de un producto en el carrito.
   * 
   * **Validación:**
   * - Si qty <= 0 → Elimina el producto del carrito
   * - Si qty > 0 → Actualiza la cantidad
   * 
   * **Uso:** Botones +/- del stepper en cada item del carrito.
   * 
   * @param productId - ID del producto a actualizar
   * @param qty - Nueva cantidad deseada
   * 
   * @example
   * // Incrementar cantidad
   * this.updateQty(1, item.quantity + 1);
   * 
   * // Decrementar cantidad
   * this.updateQty(1, item.quantity - 1); // Si llega a 0, se elimina
   */
  updateQty(productId: number, qty: number) {
      if (qty <= 0) {
          // Cantidad 0 o negativa: eliminar producto
          this.removeItem(productId);
      } else {
          // Actualizar cantidad en el servicio
          this.cartService.updateQuantity(productId, qty);
      }
  }

  /**
   * Elimina un producto del carrito por completo.
   * 
   * @param id - ID del producto a eliminar
   * 
   * @example
   * // Botón de eliminar en cada item
   * <ion-button (click)="removeItem(item.product.id)">
   *   <ion-icon name="trash-outline"></ion-icon>
   * </ion-button>
   */
  removeItem(id: number) {
      this.cartService.removeFromCart(id);
      this.notify.showWarning('Producto eliminado');
  }

  /**
   * Vacía todo el carrito eliminando todos los items.
   * 
   * **Mejora sugerida:** Agregar modal de confirmación antes de vaciar.
   * Actualmente vacía inmediatamente sin confirmación.
   * 
   * @example
   * // Botón "Vaciar Carrito"
   * <ion-button (click)="confirmClear()">Vaciar Carrito</ion-button>
   */
  confirmClear() {
      // TODO: Implementar modal de confirmación antes de vaciar
      this.cartService.clearCart();
      this.notify.showInfo('Carrito vaciado');
  }

  /**
   * Navega de vuelta al catálogo de productos.
   * Usa navigateBack para mantener la animación de retroceso.
   */
  goToCatalog() {
      this.nav.navigateBack('/catalog');
  }

  /**
   * Inicia el proceso de checkout (finalizar compra).
   * 
   * **Flujo de validación:**
   * 1. Verificar que el usuario esté autenticado
   * 2. Si NO está autenticado:
   *    - Mostrar toast informativo
   *    - Redirigir a /login
   *    - return (no continuar)
   * 3. Si SÍ está autenticado:
   *    - Calcular total del carrito
   *    - Mostrar modal de confirmación con el total
   *    - Esperar respuesta del usuario (confirmar/cancelar)
   * 4. Si confirma → Llamar a processOrder()
   * 
   * **Modal de confirmación:**
   * - Componente: ConfirmationModalComponent
   * - Props: title, message, total
   * - Respuesta: data.confirmed (boolean)
   * 
   * @example
   * // Botón de checkout en el template
   * <ion-button (click)="checkout()">
   *   Proceder al Checkout
   * </ion-button>
   */
  async checkout() {
      // 1. Verificar autenticación
      if (!this.auth.isAuthenticated()) {
          // Usuario no logueado: redirigir al login
          this.notify.showInfo('Debes iniciar sesión para finalizar tu compra');
          this.nav.navigateForward('/login');
          return;
      }
      
      // 2. Calcular total del carrito
      const items = this.cartService.getCurrentValue();
      const total = items.reduce((acc, i) => acc + i.total, 0);

      // 3. Mostrar modal de confirmación
      const modal = await this.modalCtrl.create({
          component: ConfirmationModalComponent,
          componentProps: {
              title: 'Confirmar Pedido',
              message: '¿Estás seguro de que deseas procesar la compra?',
              total: total
          },
          cssClass: 'small-modal'
      });

      await modal.present();
      const { data } = await modal.onWillDismiss();

      // 4. Procesar pedido si el usuario confirmó
      if (data && data.confirmed) {
          this.processOrder();
      }
  }

  /**
   * Procesa el pedido con estrategia Offline-First.
   * 
   * **Flujo de creación de pedido:**
   * 1. Mostrar loading spinner ("Procesando tu pedido...")
   * 2. Obtener items del carrito y calcular total
   * 3. Crear objeto Order con:
   *    - id: timestamp único (Date.now().toString())
   *    - items: array de CartItem[]
   *    - total: suma de todos los items
   *    - date: new Date()
   *    - status: 'pending' (esperando sincronización)
   *    - userId: UID del usuario autenticado
   * 4. Llamar a OrderService.createOrder() que:
   *    a. Guarda en LocalStorage SIEMPRE (éxito garantizado)
   *    b. Intenta sync con Firebase en segundo plano
   *    c. Actualiza status a 'synced' si Firebase responde
   * 5. Si éxito:
   *    - Ocultar loading
   *    - Vaciar carrito (CartService.clearCart)
   *    - Mostrar toast "Pedido realizado con éxito"
   *    - Navegar a /confirm (página de confirmación)
   * 6. Si error (muy raro, solo si falla LocalStorage):
   *    - Ocultar loading
   *    - Mostrar toast de error
   * 
   * **Estrategia Offline-First:**
   * - El pedido SIEMPRE se guarda localmente (funciona sin internet)
   * - La sincronización con Firebase es opcional y no bloqueante
   * - El usuario ve éxito inmediatamente (UX fluida)
   * - Si falla Firebase, el pedido queda 'pending' para reintentar después
   * 
   * **Timeout de seguridad:**
   * Loading tiene duration: 5000ms para auto-dismissal en caso de que
   * loading.dismiss() no se llame (por ejemplo, si hay un error no manejado).
   * 
   * **Memory leak prevention:**
   * Usa takeUntil(destroy$) para cancelar la subscripción si el usuario
   * navega antes de que complete la creación del pedido.
   * 
   * @private Este método solo debe llamarse desde checkout() después de confirmar
   */
  private async processOrder() {
      // 1. Mostrar loading spinner
      const loading = await this.loadingCtrl.create({
          message: 'Procesando tu pedido...',
          duration: 5000 // Timeout de seguridad 5s (auto-dismissal)
      });
      await loading.present();

      // 2. Obtener items y calcular total
      const items = this.cartService.getCurrentValue();
      const total = items.reduce((acc, i) => acc + i.total, 0);
      
      // 3. Crear objeto Order
      const order: Order = {
          id: Date.now().toString(), // ID único basado en timestamp
          items: items,
          total: total,
          date: new Date(),
          status: 'pending', // Estado inicial (esperando sync)
          userId: this.auth.currentUserValue?.uid || '1' // UID del usuario o fallback '1'
      };

      // 4. Crear pedido con estrategia Offline-First
      this.orderService.createOrder(order)
        .pipe(takeUntil(this.destroy$)) // Cancelar si el componente se destruye
        .subscribe({
          next: () => {
            // Pedido guardado exitosamente (al menos en LocalStorage)
            loading.dismiss();
            this.cartService.clearCart(); // Vaciar carrito
            this.notify.showSuccess('¡Pedido realizado con éxito!');
            this.nav.navigateRoot('/confirm'); // Ir a página de confirmación
          },
          error: (err) => {
            // Error guardando pedido (muy raro, solo si falla LocalStorage)
            loading.dismiss();
            // Log solo en desarrollo
            if (!environment.production) {
              console.error('Order creation failed:', err);
            }
            this.notify.showError('Hubo un problema al crear el pedido.');
          }
        });
  }

  /**
   * Hook de destrucción que limpia las subscripciones.
   * Cancela processOrder() si el usuario navega antes de completar.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
