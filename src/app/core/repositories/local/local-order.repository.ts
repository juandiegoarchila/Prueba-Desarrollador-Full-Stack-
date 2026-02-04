import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRepository } from '../order.repository';
import { Order } from '../../../models/order.model';
import { StorageService } from '../../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class LocalOrderRepository implements OrderRepository {
  private readonly ORDERS_KEY = 'local_orders';

  constructor(private storage: StorageService) {}

  createOrder(order: Order): Observable<Order> {
    return new Observable(observer => {
      const run = async () => {
        try {
          const orders = await this.storage.get(this.ORDERS_KEY);
          const currentOrders = orders || [];
          currentOrders.push(order);
          await this.storage.set(this.ORDERS_KEY, currentOrders);
          observer.next(order);
          observer.complete();
        } catch (err) {
          observer.error(err);
        }
      };
      run();
    });
  }

  getOrders(userId: string): Observable<Order[]> {
    return new Observable(observer => {
      const run = async () => {
        try {
          const orders = await this.storage.get(this.ORDERS_KEY);
          const userOrders = (orders || []).filter((o: Order) => o.userId === userId);
          observer.next(userOrders);
          observer.complete();
        } catch (err) {
          observer.error(err);
        }
      };
      run();
    });
  }

  async updateStatus(orderId: string, status: 'pending' | 'synced' | 'completed'): Promise<void> {
      const orders = (await this.storage.get(this.ORDERS_KEY)) || [];
      const orderIndex = orders.findIndex((o: Order) => o.id === orderId);
      if (orderIndex > -1) {
          orders[orderIndex].status = status;
          await this.storage.set(this.ORDERS_KEY, orders);
      }
  }
}
