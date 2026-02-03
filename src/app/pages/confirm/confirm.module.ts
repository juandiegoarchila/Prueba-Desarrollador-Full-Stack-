import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ConfirmPage } from './confirm.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: ConfirmPage }])
  ],
  declarations: [ConfirmPage]
})
export class ConfirmPageModule {}
