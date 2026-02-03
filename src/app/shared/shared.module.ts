import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';

@NgModule({
  declarations: [
    ProductCardComponent,
    ConfirmationModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    ProductCardComponent,
    ConfirmationModalComponent,
    CommonModule,
    IonicModule
  ]
})
export class SharedModule { }
