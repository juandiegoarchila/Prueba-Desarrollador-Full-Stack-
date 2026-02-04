import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';

@NgModule({
  declarations: [
    ProductCardComponent,
    ConfirmationModalComponent,
    AppHeaderComponent,
    EmptyStateComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  exports: [
    ProductCardComponent,
    ConfirmationModalComponent,
    AppHeaderComponent,
    EmptyStateComponent,
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
