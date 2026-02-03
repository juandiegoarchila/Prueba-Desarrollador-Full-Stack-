import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { OrderRepository } from '../order.repository';
import { Order } from '../../../models/order.model';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseOrderRepository implements OrderRepository {
  private db;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
  }

  createOrder(order: Order): Observable<Order> {
    const ordersCol = collection(this.db, 'orders');
    return from(addDoc(ordersCol, order)).pipe(
        map(() => {
            order.status = 'synced'; // Mark as synced if successful
            return order;
        })
    ) as unknown as Observable<Order>;
  }

  getOrders(userId: string): Observable<Order[]> {
    const ordersCol = collection(this.db, 'orders');
    const q = query(ordersCol, where('userId', '==', userId));
    
    return from(getDocs(q).then(snapshot => {
        return snapshot.docs.map(doc => doc.data() as Order);
    }));
  }
}
import { map } from 'rxjs/operators';
