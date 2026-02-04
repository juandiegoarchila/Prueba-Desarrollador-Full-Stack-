import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Order } from '../../models/order.model';
import { LocalOrderRepository } from '../repositories/local/local-order.repository';
import { FirebaseOrderRepository } from '../repositories/firebase/firebase-order.repository';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();
  public pendingCount$ = this.orders$.pipe(
    map(orders => orders.filter(o => o.status === 'pending').length)
  );

  constructor(
      private localRepo: LocalOrderRepository,
      private firebaseRepo: FirebaseOrderRepository,
      private authService: AuthService
  ) {
      // Inicializar con los pedidos del usuario actual
      this.authService.currentUser$.subscribe(user => {
          if (user) {
              this.loadInitialOrders(user.uid);
          } else {
              this.ordersSubject.next([]);
          }
      });
  }

  private loadInitialOrders(userId: string) {
      this.localRepo.getOrders(userId).subscribe(orders => {
          this.ordersSubject.next(orders);
      });
  }

  createOrder(order: Order): Observable<Order> {
      // 1. Siempre guardar en local primero (Offline First)
      order.status = 'pending';
      return this.localRepo.createOrder(order).pipe(
          tap(savedOrder => {
              // Actualizar el subject local
              const currentOrders = this.ordersSubject.value;
              this.ordersSubject.next([savedOrder, ...currentOrders]);

              if (environment.useFirebase) {
                  this.firebaseRepo.createOrder(savedOrder).pipe(
                      tap(() => {
                          this.localRepo.updateStatus(savedOrder.id, 'synced');
                          // Actualizar status en el subject
                          const updatedOrders = this.ordersSubject.value.map(o => 
                              o.id === savedOrder.id ? { ...o, status: 'synced' as const } : o
                          );
                          this.ordersSubject.next(updatedOrders);
                      }),
                      catchError(err => {
                          console.warn('Sync failed, keeping local order', err);
                          return of(savedOrder);
                      })
                  ).subscribe();
              }
          })
      );
  }

  getOrders(userId: string): Observable<Order[]> {
      return this.orders$;
  }
}
