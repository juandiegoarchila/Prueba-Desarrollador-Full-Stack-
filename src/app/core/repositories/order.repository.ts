import { Observable } from 'rxjs';
import { Order } from '../../models/order.model';

export interface OrderRepository {
    createOrder(order: Order): Observable<Order>;
    getOrders(userId: string): Observable<Order[]>;
}
