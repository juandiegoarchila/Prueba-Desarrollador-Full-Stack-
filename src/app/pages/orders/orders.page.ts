import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from '../../models/order.model';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { NavController, ModalController } from '@ionic/angular';
import { OrderDetailComponent } from './order-detail/order-detail.component';

@Component({
  selector: 'app-orders',
   template: `
      <app-header title="Mis Pedidos" [backButton]="true">
            <ion-button (click)="goToCatalog()" fill="clear" color="light">
                  <ion-icon name="arrow-back-circle-outline" slot="start"></ion-icon>
                  Volver
            </ion-button>
      </app-header>

      <ion-content class="ion-padding" color="light">
         <div *ngIf="orders$ | async as orders">
            <div *ngIf="orders.length > 0; else emptyOrders">
                   <ion-card *ngFor="let order of orders" class="order-card" (click)="viewDetail(order)">
                        <div class="card-inner">
                              <div class="card-header-section">
                                    <div class="order-header">
                                          <div class="order-id">
                                                ID Pedido
                                                <span class="order-id-number">#{{ getShortId(order.id) }}</span>
                                          </div>
                                          <ion-badge class="badge-modern" [color]="getStatusColor(order.status)">
                                                {{ getStatusLabel(order.status) }}
                                          </ion-badge>
                                    </div>
                                    <div class="order-date">
                                          <ion-icon name="time-outline" color="primary"></ion-icon>
                                          <span>{{ order.date | date:'MMM d, y, h:mm a' }}</span>
                                    </div>
                                    <ion-icon name="chevron-forward-outline" color="medium" class="chevron-icon"></ion-icon>
                              </div>

                              <div class="order-summary-section">
                                    <div class="summary-item">
                                          <span class="summary-label">Contenido</span>
                                          <span class="summary-value">{{ getItemsCount(order) }} {{ getItemsCount(order) === 1 ? 'artículo' : 'artículos' }}</span>
                                    </div>
                                    <div class="summary-item" style="text-align: right;">
                                          <span class="summary-label">Total Pedido</span>
                                          <span class="summary-value total-value">{{ order.total | currency:'COP':'symbol':'1.0-0' }}</span>
                                    </div>
                              </div>
                        </div>
                   </ion-card>
            </div>
        
            <ng-template #emptyOrders>
                <app-empty-state 
                        title="Sin Pedidos" 
                        description="Aún no has realizado ninguna compra." 
                        icon="bag-handle-outline"
                        actionText="Ir al catálogo"
                        (action)="goToCatalog()">
                </app-empty-state>
            </ng-template>
         </div>
      </ion-content>
   `,
  styles: [`
    .order-card {
       border-radius: 20px;
       margin-bottom: 20px;
       box-shadow: 0 10px 25px rgba(0,0,0,0.05);
       background: white;
       border: none;
       overflow: hidden;
       transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .order-card:active {
        transform: scale(0.97);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .card-header-section {
       padding: 20px;
       position: relative;
    }
    .order-header {
       display: flex;
       justify-content: space-between;
       align-items: flex-start;
       margin-bottom: 12px;
    }
    .order-id { 
       font-size: 11px; 
       font-weight: 600; 
       color: var(--ion-color-medium); 
       text-transform: uppercase;
       letter-spacing: 1px;
    }
    .order-id-number {
       font-size: 20px;
       font-weight: 800;
       color: #2d3436;
       display: block;
       margin-top: 2px;
    }
    .order-date {
       display: flex;
       align-items: center;
       gap: 6px;
       font-size: 13px;
       color: var(--ion-color-medium);
       font-weight: 500;
    }
    .chevron-icon {
       position: absolute;
       right: 15px;
       bottom: 25px;
       font-size: 20px;
       opacity: 0.5;
    }
    .order-summary-section {
       background: #fdfdfd;
       padding: 15px 20px;
       display: flex;
       justify-content: space-between;
       align-items: center;
       border-top: 1px dashed #eee;
    }
    .summary-item {
       display: flex;
       flex-direction: column;
    }
    .summary-label {
       font-size: 10px;
       color: #a0a0a0;
       text-transform: uppercase;
       font-weight: 700;
       letter-spacing: 0.5px;
    }
    .summary-value {
       font-weight: 700;
       color: #2d3436;
       font-size: 15px;
    }
    .total-value {
       color: var(--ion-color-primary);
       font-size: 18px;
       font-weight: 800;
    }
    .badge-modern {
       --padding-start: 12px;
       --padding-end: 12px;
       --padding-top: 6px;
       --padding-bottom: 6px;
       border-radius: 10px;
       font-size: 10px;
       font-weight: 700;
       letter-spacing: 0.5px;
       box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
  `]
})
export class OrdersPage implements OnInit {
  orders$: Observable<Order[]> | undefined;

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private nav: NavController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
     const userId = this.auth.currentUserValue?.uid || '1';
     this.orders$ = this.orderService.getOrders(userId).pipe(
         map(orders => orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
     );
  }

  goToCatalog() {
      this.nav.navigateBack('/catalog');
  }

  getStatusColor(status: string): string {
      switch(status) {
          case 'completed': return 'success';
          case 'synced': return 'primary';
          case 'pending': return 'warning';
          default: return 'medium';
      }
  }

  getStatusLabel(status: string): string {
     switch(status) {
        case 'completed': return 'Completado';
        case 'synced': return 'Registrado';
        case 'pending': return 'Pendiente';
        default: return 'Estado';
     }
  }

  getItemsCount(order: Order): number {
      return order.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getShortId(id: string): string {
      return id && id.length > 6 ? id.slice(-6) : id;
  }

  async viewDetail(order: Order) {
      const modal = await this.modalCtrl.create({
          component: OrderDetailComponent,
          componentProps: { order }
      });
      await modal.present();
  }
}
