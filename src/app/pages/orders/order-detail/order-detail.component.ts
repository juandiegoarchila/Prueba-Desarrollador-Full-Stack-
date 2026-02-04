import { Component, Input } from '@angular/core';
import { Order } from '../../../models/order.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-detail',
  template: `
    <ion-header class="ion-no-border">
        <ion-toolbar color="white">
           <ion-title>Detalle del Pedido</ion-title>
           <ion-buttons slot="end">
              <ion-button (click)="close()" color="dark">
                  <ion-icon name="close-circle" slot="icon-only"></ion-icon>
              </ion-button>
           </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content color="light">
        <div class="order-status-banner" [ngClass]="order.status">
            <div class="status-icon-container">
                <ion-icon [name]="getStatusIcon(order.status)"></ion-icon>
            </div>
            <div class="status-info">
                <h2>{{ getStatusLabel(order.status) }}</h2>
                <p>Pedido #{{ order.id | slice:-6 }} • {{ order.date | date:'medium' }}</p>
            </div>
        </div>

        <div class="section-title">Artículos en tu pedido</div>

        <div class="items-container">
            <div class="order-item-card" *ngFor="let item of order.items">
                <div class="item-main">
                    <ion-thumbnail class="product-thumb">
                        <img [src]="item.product.imageUrl" />
                    </ion-thumbnail>
                    <div class="item-details">
                        <span class="product-name">{{ item.product.name }}</span>
                        <div class="price-qty">
                            <span class="qty">Cant: {{ item.quantity }}</span>
                            <span class="unit-price">x {{ item.product.price | currency:'COP':'symbol':'1.0-0' }}</span>
                        </div>
                    </div>
                </div>
                <div class="item-footer">
                    <span class="subtotal-label">Subtotal</span>
                    <span class="item-total">{{ item.total | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
            </div>
        </div>

        <div class="billing-section">
            <div class="section-title">Resumen de Pago</div>
            <div class="billing-card">
                <div class="billing-row">
                    <span>Subtotal Artículos</span>
                    <span>{{ order.total | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
                <div class="billing-row">
                    <span>Envío</span>
                    <span class="free">Gratis</span>
                </div>
                <div class="divider-dashed"></div>
                <div class="billing-row total">
                    <span>Total Pagado</span>
                    <span class="total-amount">{{ order.total | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
            </div>
        </div>
    </ion-content>
    <ion-footer class="ion-no-border">
        <ion-toolbar color="white" class="ion-padding-horizontal ion-padding-bottom">
            <ion-button expand="block" fill="outline" (click)="close()" class="main-button">
                Entendido
            </ion-button>
        </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    ion-title {
        font-weight: 800;
        font-size: 18px;
        letter-spacing: -0.5px;
    }
    .order-status-banner {
        padding: 30px 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        background: white;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
    }
    .status-icon-container {
        width: 50px;
        height: 50px;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
    }
    
    /* Status Styles */
    .pending .status-icon-container { background: #fff4e6; color: #fd7e14; }
    .synced .status-icon-container { background: #e7f5ff; color: #228be6; }
    .completed .status-icon-container { background: #ebfbee; color: #40c057; }
    
    .status-info h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 800;
        color: #2d3436;
    }
    .status-info p {
        margin: 4px 0 0;
        font-size: 13px;
        color: #636e72;
    }

    .section-title {
        margin: 0 20px 12px;
        font-size: 12px;
        font-weight: 700;
        color: #a0a0a0;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .items-container {
        padding: 0 20px;
        margin-bottom: 25px;
    }
    .order-item-card {
        background: white;
        border-radius: 16px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .item-main {
        display: flex;
        gap: 15px;
        align-items: center;
    }
    .product-thumb {
        --border-radius: 12px;
        width: 60px;
        height: 60px;
        background: #f8f9fa;
    }
    .item-details {
        flex: 1;
    }
    .product-name {
        font-weight: 700;
        font-size: 14px;
        color: #2d3436;
        display: block;
        margin-bottom: 4px;
    }
    .price-qty {
        font-size: 13px;
        color: #636e72;
    }
    .qty { font-weight: 600; color: var(--ion-color-primary); }
    
    .item-footer {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f8f9fa;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .subtotal-label { font-size: 11px; color: #b2bec3; font-weight: 600; }
    .item-total { font-weight: 800; color: #2d3436; font-size: 15px; }

    .billing-section {
        padding: 0 20px 40px;
    }
    .billing-card {
        background: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .billing-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
        color: #636e72;
    }
    .free { color: #40c057; font-weight: 700; }
    .divider-dashed {
        height: 1px;
        border-top: 1px dashed #eee;
        margin: 15px 0;
    }
    .billing-row.total {
        margin-bottom: 0;
        color: #2d3436;
        font-weight: 800;
    }
    .total-amount {
        font-size: 20px;
        color: var(--ion-color-primary);
    }
    .main-button {
        --border-radius: 12px;
        font-weight: 700;
        margin-top: 10px;
    }
  `]
})
export class OrderDetailComponent {
    @Input() order!: Order;
    
    constructor(private modalCtrl: ModalController) {}

    close() {
        this.modalCtrl.dismiss();
    }

    getStatusColor(status: string): string {
        switch(status) {
            case 'completed': return 'success';
            case 'synced': return 'primary';
            case 'pending': return 'warning';
            default: return 'medium';
        }
    }

    getStatusIcon(status: string): string {
        switch(status) {
            case 'completed': return 'checkmark-done-circle';
            case 'synced': return 'cloud-done-outline';
            case 'pending': return 'time-outline';
            default: return 'help-circle-outline';
        }
    }

    getStatusLabel(status: string): string {
        switch(status) {
           case 'completed': return '¡Completado!';
           case 'synced': return 'Registrado';
           case 'pending': return 'Pendiente';
           default: return 'Estado';
        }
    }
}

