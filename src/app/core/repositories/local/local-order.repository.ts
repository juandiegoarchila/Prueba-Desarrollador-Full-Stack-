import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRepository } from '../order.repository';
import { Order } from '../../../models/order.model';
import { StorageService } from '../../storage/storage.service';

/**
 * Implementación local del repositorio de pedidos usando Ionic Storage.
 * 
 * **Responsabilidades:**
 * - Guardar pedidos en almacenamiento local (persistencia offline)
 * - Recuperar pedidos por usuario
 * - Actualizar el estado de sincronización de pedidos
 * 
 * **Estrategia de almacenamiento:**
 * - Todos los pedidos se guardan en un único array bajo la clave 'local_orders'
 * - Cada pedido tiene userId para filtrar por usuario
 * - Los status posibles son: 'pending' | 'synced' | 'completed'
 * 
 * **Uso en arquitectura Offline-First:**
 * ```
 * Usuario crea pedido
 *     ↓
 * LocalOrderRepository.createOrder() ← Siempre primero (offline)
 *     ↓
 * Pedido guardado localmente (status: 'pending')
 *     ↓
 * OrderService intenta sync con Firebase (segundo plano)
 *     ↓
 * Si éxito: updateStatus('synced')
 * Si falla: queda 'pending' para reintentar
 * ```
 * 
 * **Ventajas:**
 * - Funciona 100% offline
 * - Datos nunca se pierden (persisten en Storage)
 * - Sincronización es opcional y no bloqueante
 * 
 * @example
 * // Crear pedido offline
 * const order: Order = {
 *   id: Date.now().toString(),
 *   userId: 'user123',
 *   items: [...],
 *   total: 150000,
 *   status: 'pending',
 *   createdAt: new Date()
 * };
 * 
 * this.localOrderRepo.createOrder(order).subscribe({
 *   next: (saved) => console.log('Pedido guardado localmente:', saved.id),
 *   error: (err) => console.error('Error guardando pedido:', err)
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class LocalOrderRepository implements OrderRepository {
  /** Clave de Storage donde se guardan todos los pedidos */
  private readonly ORDERS_KEY = 'local_orders';

  constructor(private storage: StorageService) {}

  /**
   * Crea un nuevo pedido en el almacenamiento local.
   * 
   * **Flujo de creación:**
   * 1. Lee el array actual de pedidos desde Storage
   * 2. Agrega el nuevo pedido al array
   * 3. Guarda el array actualizado en Storage
   * 4. Devuelve el pedido creado
   * 
   * **Importante:**
   * Este método NO verifica duplicados. El ID debe ser único (usar timestamp o UUID).
   * 
   * @param order - Pedido a crear (debe incluir id, userId, items, total, status)
   * @returns Observable con el pedido guardado
   * 
   * @example
   * const newOrder: Order = {
   *   id: Date.now().toString(),
   *   userId: user.uid,
   *   items: cartItems,
   *   total: 250000,
   *   status: 'pending',
   *   createdAt: new Date()
   * };
   * 
   * this.repo.createOrder(newOrder).subscribe(saved => {
   *   console.log('Pedido guardado:', saved.id);
   * });
   */
  createOrder(order: Order): Observable<Order> {
    return new Observable(observer => {
      const run = async () => {
        try {
          // 1. Leer pedidos existentes desde Storage
          const orders = await this.storage.get(this.ORDERS_KEY);
          
          // 2. Type guard: asegurar que sea un array
          const currentOrders: Order[] = Array.isArray(orders) ? orders : [];
          
          // 3. Agregar el nuevo pedido al array
          currentOrders.push(order);
          
          // 4. Guardar el array actualizado en Storage
          await this.storage.set(this.ORDERS_KEY, currentOrders);
          
          // 5. Emitir el pedido creado exitosamente
          observer.next(order);
          observer.complete();
        } catch (err) {
          // Error de Storage (muy raro, pero puede pasar)
          observer.error(err);
        }
      };
      run();
    });
  }

  /**
   * Obtiene todos los pedidos de un usuario específico.
   * 
   * **Filtrado:**
   * - Lee TODOS los pedidos desde Storage
   * - Filtra solo los que pertenecen al userId especificado
   * - Devuelve array vacío si no hay pedidos del usuario
   * 
   * @param userId - UID del usuario cuyos pedidos se quieren obtener
   * @returns Observable con array de pedidos del usuario
   * 
   * @example
   * this.repo.getOrders('user123').subscribe(orders => {
   *   console.log('Pedidos del usuario:', orders.length);
   *   const pending = orders.filter(o => o.status === 'pending');
   *   console.log('Pendientes de sincronizar:', pending.length);
   * });
   */
  getOrders(userId: string): Observable<Order[]> {
    return new Observable(observer => {
      const run = async () => {
        try {
          // 1. Leer todos los pedidos desde Storage
          const orders = await this.storage.get(this.ORDERS_KEY);
          
          // 2. Type guard: asegurar que sea un array
          const ordersList: Order[] = Array.isArray(orders) ? orders : [];
          
          // 3. Filtrar solo los pedidos del usuario especificado
          const userOrders = ordersList.filter((o: Order) => o.userId === userId);
          
          // 4. Emitir el array filtrado
          observer.next(userOrders);
          observer.complete();
        } catch (err) {
          observer.error(err);
        }
      };
      run();
    });
  }

  /**
   * Actualiza el estado de sincronización de un pedido específico.
   * 
   * **Estados:**
   * - `pending`: Guardado localmente, esperando sincronización con Firebase
   * - `synced`: Sincronizado exitosamente con Firebase
   * - `completed`: Pedido completado (entregado al cliente)
   * 
   * **Uso típico:**
   * ```typescript
   * // Después de sincronizar con Firebase exitosamente
   * await this.localRepo.updateStatus(order.id, 'synced');
   * ```
   * 
   * @param orderId - ID del pedido a actualizar
   * @param status - Nuevo estado del pedido
   * 
   * @example
   * // Marcar como sincronizado después de subir a Firestore
   * await this.localOrderRepo.updateStatus('1234567890', 'synced');
   * 
   * // Marcar como completado después de entrega
   * await this.localOrderRepo.updateStatus('1234567890', 'completed');
   */
  async updateStatus(orderId: string, status: 'pending' | 'synced' | 'completed'): Promise<void> {
      // 1. Leer todos los pedidos desde Storage
      const ordersData = await this.storage.get(this.ORDERS_KEY);
      
      // 2. Type guard: asegurar que sea un array
      const orders: Order[] = Array.isArray(ordersData) ? ordersData : [];
      
      // 3. Buscar el índice del pedido a actualizar
      const orderIndex = orders.findIndex((o: Order) => o.id === orderId);
      
      // 4. Si se encuentra, actualizar el status y guardar
      if (orderIndex > -1) {
          orders[orderIndex].status = status;
          await this.storage.set(this.ORDERS_KEY, orders);
      }
      // Si no se encuentra, no hace nada (operación idempotente)
  }
}
