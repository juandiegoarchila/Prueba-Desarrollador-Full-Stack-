import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Order } from '../../models/order.model';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { NavController, ModalController } from '@ionic/angular';
import { OrderDetailComponent } from './order-detail/order-detail.component';

/**
 * **Página de Historial de Pedidos (OrdersPage)**
 * 
 * Muestra el listado completo de todos los pedidos del usuario ordenados por fecha (más recientes primero).
 * 
 * **Responsabilidades:**
 * - Cargar pedidos desde OrderService.getOrders(userId)
 * - Ordenar pedidos por fecha descendente (más nuevos primero)
 * - Mostrar cada pedido con información resumida:
 *   * ID corto (últimos 6 caracteres)
 *   * Badge de estado (pending, synced, completed)
 *   * Fecha formateada (MMM d, y, h:mm a)
 *   * Cantidad de artículos
 *   * Total en COP
 * - Permitir ver detalle de cada pedido en modal (OrderDetailComponent)
 * - Mostrar empty-state si no hay pedidos
 * 
 * **Flujo de navegación:**
 * 1. Usuario llega desde CatalogPage (botón "Mis Pedidos")
 * 2. Ve listado de pedidos o mensaje "Sin Pedidos"
 * 3. Puede hacer clic en un pedido para ver detalle en modal
 * 4. Puede volver al catálogo con botón "Volver" en header
 * 
 * **Estados de pedido:**
 * - `pending` (amarillo/warning): Pedido guardado localmente, esperando sync con Firebase
 * - `synced` (azul/primary): Pedido sincronizado exitosamente con Firebase
 * - `completed` (verde/success): Pedido completado (estado final)
 * 
 * **Estrategia Offline-First:**
 * - Los pedidos se cargan desde LocalStorage (SIEMPRE disponibles)
 * - Si hay conexión, OrderService sincroniza automáticamente con Firebase
 * - El usuario SIEMPRE ve sus pedidos aunque no tenga internet
 * 
 * **Memory leak prevention:**
 * Implementa OnDestroy + takeUntil para cancelar la subscripción a orders$
 * si el usuario navega antes de que termine la carga de pedidos.
 * CRÍTICO porque orders$ es un Observable en tiempo real que puede seguir
 * emitiendo valores aunque el componente ya no esté visible.
 * 
 * **Diseño visual:**
 * - Cards con bordes redondeados (border-radius: 20px)
 * - Animación de tap (transform: scale(0.97))
 * - Badge moderno con box-shadow
 * - Separación visual con borde punteado (border-top: 1px dashed)
 * - Color total en primary (destacado)
 * 
 * @author Sistema Merpes
 * @version 1.0.0
 */
@Component({
  selector: 'app-orders',
   template: `
      <app-header title="Mis Pedidos" [backButton]="true">
            <ion-button (click)="goToCatalog()" fill="clear" color="light">
                  <ion-icon name="arrow-back-circle-outline" slot="start"></ion-icon>
                  Volver
            </ion-button>
      </app-header>

      <ion-content class="ion-padding" color="light">
         <div *ngIf="orders$ | async as orders">
            <div *ngIf="orders.length > 0; else emptyOrders">
                   <ion-card *ngFor="let order of orders" class="order-card" (click)="viewDetail(order)">
                        <div class="card-inner">
                              <div class="card-header-section">
                                    <div class="order-header">
                                          <div class="order-id">
                                                ID Pedido
                                                <span class="order-id-number">#{{ getShortId(order.id) }}</span>
                                          </div>
                                          <ion-badge class="badge-modern" [color]="getStatusColor(order.status)">
                                                {{ getStatusLabel(order.status) }}
                                          </ion-badge>
                                    </div>
                                    <div class="order-date">
                                          <ion-icon name="time-outline" color="primary"></ion-icon>
                                          <span>{{ order.date | date:'MMM d, y, h:mm a' }}</span>
                                    </div>
                                    <ion-icon name="chevron-forward-outline" color="medium" class="chevron-icon"></ion-icon>
                              </div>

                              <div class="order-summary-section">
                                    <div class="summary-item">
                                          <span class="summary-label">Contenido</span>
                                          <span class="summary-value">{{ getItemsCount(order) }} {{ getItemsCount(order) === 1 ? 'artículo' : 'artículos' }}</span>
                                    </div>
                                    <div class="summary-item" style="text-align: right;">
                                          <span class="summary-label">Total Pedido</span>
                                          <span class="summary-value total-value">{{ order.total | currency:'COP':'symbol':'1.0-0' }}</span>
                                    </div>
                              </div>
                        </div>
                   </ion-card>
            </div>
        
            <ng-template #emptyOrders>
                <app-empty-state 
                        title="Sin Pedidos" 
                        description="Aún no has realizado ninguna compra." 
                        icon="bag-handle-outline"
                        actionText="Ir al catálogo"
                        (action)="goToCatalog()">
                </app-empty-state>
            </ng-template>
         </div>
      </ion-content>
   `,
  styles: [`
    .order-card {
       border-radius: 20px;
       margin-bottom: 20px;
       box-shadow: 0 10px 25px rgba(0,0,0,0.05);
       background: white;
       border: none;
       overflow: hidden;
       transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .order-card:active {
        transform: scale(0.97);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .card-header-section {
       padding: 20px;
       position: relative;
    }
    .order-header {
       display: flex;
       justify-content: space-between;
       align-items: flex-start;
       margin-bottom: 12px;
    }
    .order-id { 
       font-size: 11px; 
       font-weight: 600; 
       color: var(--ion-color-medium); 
       text-transform: uppercase;
       letter-spacing: 1px;
    }
    .order-id-number {
       font-size: 20px;
       font-weight: 800;
       color: #2d3436;
       display: block;
       margin-top: 2px;
    }
    .order-date {
       display: flex;
       align-items: center;
       gap: 6px;
       font-size: 13px;
       color: var(--ion-color-medium);
       font-weight: 500;
    }
    .chevron-icon {
       position: absolute;
       right: 15px;
       bottom: 25px;
       font-size: 20px;
       opacity: 0.5;
    }
    .order-summary-section {
       background: #fdfdfd;
       padding: 15px 20px;
       display: flex;
       justify-content: space-between;
       align-items: center;
       border-top: 1px dashed #eee;
    }
    .summary-item {
       display: flex;
       flex-direction: column;
    }
    .summary-label {
       font-size: 10px;
       color: #a0a0a0;
       text-transform: uppercase;
       font-weight: 700;
       letter-spacing: 0.5px;
    }
    .summary-value {
       font-weight: 700;
       color: #2d3436;
       font-size: 15px;
    }
    .total-value {
       color: var(--ion-color-primary);
       font-size: 18px;
       font-weight: 800;
    }
    .badge-modern {
       --padding-start: 12px;
       --padding-end: 12px;
       --padding-top: 6px;
       --padding-bottom: 6px;
       border-radius: 10px;
       font-size: 10px;
       font-weight: 700;
       letter-spacing: 0.5px;
       box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
  `]
})
export class OrdersPage implements OnInit, OnDestroy {
  /**
   * Observable que emite el listado de pedidos del usuario.
   * Ordenados por fecha descendente (más recientes primero).
   */
  orders$: Observable<Order[]> | undefined;

  /**
   * Subject para implementar el patrón de limpieza de subscripciones.
   * Se emite un valor en ngOnDestroy() para cancelar todas las subscripciones
   * que usan takeUntil(destroy$).
   */
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private nav: NavController,
    private modalCtrl: ModalController
  ) {}

  /**
   * Carga los pedidos del usuario al inicializar el componente.
   * 
   * **Flujo de carga:**
   * 1. Obtener userId del usuario autenticado (o fallback '1')
   * 2. Llamar a OrderService.getOrders(userId) que:
   *    - Carga pedidos desde LocalStorage (sincrónico, siempre funciona)
   *    - Intenta cargar desde Firebase si hay conexión
   *    - Devuelve Observable<Order[]> con los pedidos
   * 3. Ordenar pedidos por fecha descendente (más nuevos primero)
   * 4. Asignar a orders$ para que el template lo renderice con async pipe
   * 
   * **Memory leak prevention:**
   * Usa takeUntil(destroy$) para cancelar la subscripción si el usuario
   * navega antes de que termine la carga.
   */
  ngOnInit() {
     const userId = this.auth.currentUserValue?.uid || '1';
     this.orders$ = this.orderService.getOrders(userId).pipe(
         takeUntil(this.destroy$), // Cancelar si el componente se destruye
         map(orders => orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
     );
  }

  /**
   * Navega de vuelta al catálogo de productos.
   * Usa navigateBack para mantener el historial de navegación.
   */
  goToCatalog() {
      this.nav.navigateBack('/catalog');
  }

  /**
   * Devuelve el color del badge según el estado del pedido.
   * 
   * @param status Estado del pedido ('completed', 'synced', 'pending')
   * @returns Color de Ionic ('success', 'primary', 'warning', 'medium')
   */
  getStatusColor(status: string): string {
      switch(status) {
          case 'completed': return 'success';
          case 'synced': return 'primary';
          case 'pending': return 'warning';
          default: return 'medium';
      }
  }

  /**
   * Devuelve la etiqueta en español del estado del pedido.
   * 
   * @param status Estado del pedido en inglés
   * @returns Etiqueta traducida al español
   */
  getStatusLabel(status: string): string {
     switch(status) {
        case 'completed': return 'Completado';
        case 'synced': return 'Registrado';
        case 'pending': return 'Pendiente';
        default: return 'Estado';
     }
  }

  /**
   * Calcula el total de artículos en un pedido.
   * Suma las cantidades de todos los items.
   * 
   * @param order Pedido del cual calcular la cantidad total de artículos
   * @returns Suma de las cantidades de todos los items
   * 
   * @example
   * // Pedido con 3 items: [qty: 2, qty: 1, qty: 3]
   * getItemsCount(order) // => 6
   */
  getItemsCount(order: Order): number {
      return order.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  /**
   * Devuelve los últimos 6 caracteres del ID del pedido.
   * Útil para mostrar IDs más cortos en la UI sin perder unicidad.
   * 
   * @param id ID completo del pedido (timestamp en string)
   * @returns Últimos 6 caracteres o el ID completo si es menor a 6
   * 
   * @example
   * getShortId('1736352000123') // => '000123'
   * getShortId('abc')           // => 'abc'
   */
  getShortId(id: string): string {
      return id && id.length > 6 ? id.slice(-6) : id;
  }

  /**
   * Abre un modal con el detalle completo del pedido seleccionado.
   * 
   * **Flujo del modal:**
   * 1. Crear modal con OrderDetailComponent
   * 2. Pasar el pedido como componentProps
   * 3. Presentar el modal (animación de slide-up)
   * 4. Esperar a que el usuario cierre el modal
   * 
   * **Contenido del modal:**
   * - Lista completa de items con imágenes y cantidades
   * - Subtotales por item
   * - Total del pedido
   * - Fecha y estado del pedido
   * 
   * @param order Pedido del cual mostrar el detalle
   */
  async viewDetail(order: Order) {
      const modal = await this.modalCtrl.create({
          component: OrderDetailComponent,
          componentProps: { order }
      });
      await modal.present();
  }

  /**
   * Hook de destrucción que limpia las subscripciones.
   * Cancela la subscripción a orders$ si el usuario navega antes de completar.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
