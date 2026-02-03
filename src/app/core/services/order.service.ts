import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Order } from '../../models/order.model';
import { LocalOrderRepository } from '../repositories/local/local-order.repository';
import { FirebaseOrderRepository } from '../repositories/firebase/firebase-order.repository';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
      private localRepo: LocalOrderRepository,
      private firebaseRepo: FirebaseOrderRepository
  ) {}

  createOrder(order: Order): Observable<Order> {
      // 1. Siempre guardar en local primero (Offline First)
      order.status = 'pending';
      return this.localRepo.createOrder(order).pipe(
          switchMap(savedOrder => {
              // 2. Si hay configuración de Firebase, intentar sincronizar
              if (environment.useFirebase) {
                  return this.firebaseRepo.createOrder(savedOrder).pipe(
                      map(syncedOrder => {
                          // Si es exitoso, actualizar estado local
                          this.localRepo.updateStatus(savedOrder.id, 'synced');
                          savedOrder.status = 'synced';
                          return savedOrder;
                      }),
                      catchError(err => {
                          console.warn('Sync failed, keeping local order', err);
                          return of(savedOrder);
                      })
                  );
              }
              return of(savedOrder);
          })
      );
  }

  getOrders(userId: string): Observable<Order[]> {
      return this.localRepo.getOrders(userId); 
      // Podríamos mezclar con firebase si hay red, pero por consistencia offline leemos local
  }
}
