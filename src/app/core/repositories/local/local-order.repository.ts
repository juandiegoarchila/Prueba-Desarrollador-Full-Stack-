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
  /**
   * Genera la clave de Storage específica para los pedidos de cada usuario.
   * Formato: 'orders_usuario@email.com' o 'orders_userId'
   * Esto asegura que cada usuario tenga sus propios pedidos aislados.
   */
  private getOrdersKey(userId: string): string {
    return `orders_${userId}`;
  }

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
          // 1. Obtener clave específica del usuario
          const key = this.getOrdersKey(order.userId);
          
          // 2. Leer pedidos existentes del usuario desde Storage
          const orders = await this.storage.get(key);
          
          // 3. Type guard: asegurar que sea un array
          const currentOrders: Order[] = Array.isArray(orders) ? orders : [];
          
          // 4. Agregar el nuevo pedido al array
          currentOrders.push(order);
          
          // 5. Guardar el array actualizado en Storage con la clave del usuario
          await this.storage.set(key, currentOrders);
          
          // 6. Emitir el pedido creado exitosamente
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
          // 1. Obtener clave específica del usuario
          const key = this.getOrdersKey(userId);
          
          // 2. Leer los pedidos del usuario desde Storage
          const orders = await this.storage.get(key);
          
          // 3. Type guard: asegurar que sea un array
          const ordersList: Order[] = Array.isArray(orders) ? orders : [];
          
          // 4. Los pedidos ya están filtrados por usuario gracias a la clave específica
          // No es necesario filtrar adiccionalmente porque cada usuario tiene su propia clave
          
          // 5. Emitir el array de pedidos
          observer.next(ordersList);
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
  async updateStatus(orderId: string, status: 'pending' | 'synced' | 'completed', userId: string): Promise<void> {
    // 1. Obtener clave específica del usuario
    const key = this.getOrdersKey(userId);
    
    // 2. Leer pedidos del usuario desde Storage
    const ordersData = await this.storage.get(key);
    
    // 3. Type guard: asegurar que sea un array
    const orders: Order[] = Array.isArray(ordersData) ? ordersData : [];
    
    // 4. Buscar el índice del pedido a actualizar
    const orderIndex = orders.findIndex((o: Order) => o.id === orderId);
    
    // 5. Si se encuentra, actualizar el status y guardar
    if (orderIndex > -1) {
      orders[orderIndex].status = status;
      await this.storage.set(key, orders);
    }
    // Si no se encuentra, no hace nada (operación idempotente)
  }
}
