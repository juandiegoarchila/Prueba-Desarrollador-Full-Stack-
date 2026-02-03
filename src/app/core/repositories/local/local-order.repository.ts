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
        this.storage.get(this.ORDERS_KEY).then(orders => {
            const currentOrders = orders || [];
            currentOrders.push(order);
            this.storage.set(this.ORDERS_KEY, currentOrders);
            observer.next(order);
            observer.complete();
        });
    });
  }

  getOrders(userId: string): Observable<Order[]> {
    return new Observable(observer => {
        this.storage.get(this.ORDERS_KEY).then(orders => {
            const userOrders = (orders || []).filter((o: Order) => o.userId === userId);
            observer.next(userOrders);
            observer.complete();
        });
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
