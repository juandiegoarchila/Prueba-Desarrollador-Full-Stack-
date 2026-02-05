import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Order } from '../../models/order.model';
import { LocalOrderRepository } from '../repositories/local/local-order.repository';
import { FirebaseOrderRepository } from '../repositories/firebase/firebase-order.repository';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio de gestión de pedidos con estrategia Offline-First.
 * 
 * **Arquitectura Offline-First:**
 * 1. Guardar SIEMPRE en local primero (garantiza operación sin internet)
 * 2. Intentar sincronizar con Firebase después (mejora cuando hay conexión)
 * 3. Si la sincronización falla, el pedido queda con status='pending'
 * 4. Cuando vuelva la conexión, un worker podría reintentar la sincronización
 * 
 * **Flujo de creación de pedido:**
 * ```
 * Usuario confirma → Guardar en LocalStorage (status: 'pending')
 *                 → Actualizar UI inmediatamente
 *                 → Intentar sync con Firebase
 *                 → Si éxito: cambiar status a 'synced'
 *                 → Si falla: mantener 'pending' para reintentar después
 * ```
 * 
 * **Repositorio dual:**
 * - LocalOrderRepository: Usa Ionic Storage (persistencia local garantizada)
 * - FirebaseOrderRepository: Usa Firestore (sincronización en la nube)
 * 
 * **Estados del pedido:**
 * - `pending`: Guardado localmente, esperando sincronización
 * - `synced`: Sincronizado exitosamente con Firebase
 * - `confirmed`: Pedido confirmado por el vendedor
 * - `shipped`: Pedido enviado
 * - `delivered`: Pedido entregado
 * - `cancelled`: Pedido cancelado
 * 
 * @example
 * // Crear pedido (funciona offline)
 * const order: Order = {
 *   id: Date.now().toString(),
 *   userId: user.uid,
 *   items: cartItems,
 *   total: 1500000,
 *   status: 'pending',
 *   createdAt: new Date()
 * };
 * 
 * this.orderService.createOrder(order).subscribe({
 *   next: (saved) => console.log('Pedido guardado:', saved.id),
 *   error: (err) => console.error('Error:', err)
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  /**
   * BehaviorSubject que mantiene la lista de pedidos del usuario actual.
   * Se actualiza cada vez que:
   * - El usuario inicia sesión (carga pedidos desde local)
   * - Se crea un nuevo pedido (se agrega al principio)
   * - Se sincroniza un pedido (cambia status a 'synced')
   */
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  /**
   * Observable público de los pedidos para subscripciones en componentes.
   */
  public orders$ = this.ordersSubject.asObservable();

  /**
   * Observable derivado que cuenta cuántos pedidos están pendientes de sincronización.
   * Útil para mostrar un indicador en la UI de pedidos que aún no se han subido.
   * 
   * @example
   * <ion-badge color="warning">{{ orderService.pendingCount$ | async }} pendientes</ion-badge>
   */
  public pendingCount$ = this.orders$.pipe(
    map(orders => orders.filter(o => o.status === 'pending').length)
  );

  constructor(
      private localRepo: LocalOrderRepository,
      private firebaseRepo: FirebaseOrderRepository,
      private authService: AuthService
  ) {
      /**
       * Suscribirse al usuario actual para cargar sus pedidos automáticamente.
       * Cuando el usuario cambia (login/logout), se recarga la lista de pedidos.
       */
      this.authService.currentUser$.subscribe(user => {
          if (user) {
              this.loadInitialOrders(user.uid);
          } else {
              // Usuario deslogueado: limpiar pedidos
              this.ordersSubject.next([]);
          }
      });
  }

  /**
   * Carga los pedidos del usuario desde el repositorio local.
   * Se ejecuta automáticamente cuando el usuario inicia sesión.
   * 
   * @param userId - UID del usuario autenticado
   */
  private loadInitialOrders(userId: string) {
      this.localRepo.getOrders(userId).subscribe(orders => {
          this.ordersSubject.next(orders);
      });
  }

  /**
   * Crea un nuevo pedido con estrategia Offline-First.
   * 
   * **Flujo de ejecución:**
   * 1. Establece status='pending'
   * 2. Guarda en LocalStorage (siempre exitoso, incluso offline)
   * 3. Actualiza la UI inmediatamente con el pedido guardado
   * 4. Si environment.useFirebase === true:
   *    a. Intenta subir a Firestore
   *    b. Si éxito: actualiza status a 'synced'
   *    c. Si falla: mantiene 'pending' (se puede reintentar después)
   * 
   * **Ventajas:**
   * - Usuario nunca pierde datos (incluso sin conexión)
   * - UI responde instantáneamente (no espera a Firebase)
   * - Sincronización transparente en segundo plano
   * 
   * @param order - Pedido a crear (debe incluir userId, items, total)
   * @returns Observable con el pedido guardado localmente
   * 
   * @example
   * const order: Order = {
   *   id: Date.now().toString(),
   *   userId: this.auth.currentUserValue!.uid,
   *   items: this.cart.getCurrentValue(),
   *   total: this.totalAmount,
   *   status: 'pending',
   *   createdAt: new Date()
   * };
   * 
   * this.orderService.createOrder(order).subscribe({
   *   next: (saved) => {
   *     console.log('Pedido guardado:', saved.id);
   *     this.cart.clearCart();
   *   },
   *   error: (err) => console.error('Error guardando pedido:', err)
   * });
   */
  createOrder(order: Order): Observable<Order> {
      // 1. PASO CRÍTICO: Siempre guardar en local primero (Offline First)
      order.status = 'pending';
      return this.localRepo.createOrder(order).pipe(
          tap(savedOrder => {
              // 2. Actualizar la UI inmediatamente (no esperar a Firebase)
              const currentOrders = this.ordersSubject.value;
              this.ordersSubject.next([savedOrder, ...currentOrders]);

              // 3. Intentar sincronizar con Firebase (solo si está habilitado)
              if (environment.useFirebase) {
                  this.firebaseRepo.createOrder(savedOrder).pipe(
                      tap(() => {
                          // Sincronización exitosa: actualizar status a 'synced'
                          this.localRepo.updateStatus(savedOrder.id, 'synced', savedOrder.userId);
                          
                          // Actualizar el status en la UI
                          const updatedOrders = this.ordersSubject.value.map(o => 
                              o.id === savedOrder.id ? { ...o, status: 'synced' as const } : o
                          );
                          this.ordersSubject.next(updatedOrders);
                      }),
                      catchError(err => {
                          // Sincronización falló: el pedido queda 'pending'
                          // No es un error crítico, se puede reintentar después
                          console.warn('⚠️ Sync failed, order saved locally as pending', err);
                          return of(savedOrder);
                      })
                  ).subscribe();
              }
          })
      );
  }

  /**
   * Obtiene los pedidos del usuario actual.
   * 
   * **Nota:** Este método devuelve el observable orders$ directamente.
   * Los pedidos ya están cargados en el constructor cuando el usuario inicia sesión.
   * 
   * @param userId - UID del usuario (actualmente no se usa, se toma del currentUser$)
   * @returns Observable con la lista de pedidos del usuario
   * 
   * @example
   * this.orderService.getOrders(userId).subscribe(orders => {
   *   this.myOrders = orders;
   * });
   */
  getOrders(userId: string): Observable<Order[]> {
      return this.orders$;
  }
}
