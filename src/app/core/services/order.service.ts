import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../../models/order.model';
import { OrderRepository } from '../repositories/order.repository';
import { LocalOrderRepository } from '../repositories/local/local-order.repository';
import { FirebaseOrderRepository } from '../repositories/firebase/firebase-order.repository';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private repository: OrderRepository;

  constructor(private injector: Injector) {
      if (environment.useFirebase) {
          this.repository = this.injector.get(FirebaseOrderRepository);
      } else {
          this.repository = this.injector.get(LocalOrderRepository);
      }
  }

  createOrder(order: Order): Observable<Order> {
      return this.repository.createOrder(order);
  }

  getOrders(userId: string): Observable<Order[]> {
      return this.repository.getOrders(userId);
  }
}
