import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start" *ngIf="backButton">
          <ion-back-button defaultHref="/catalog" text=""></ion-back-button>
        </ion-buttons>
        <ion-title class="text-semibold">{{ title }}</ion-title>
        <ion-buttons slot="end">
            <ng-content></ng-content>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  `,
  styles: [`
    ion-toolbar {
      --box-shadow: 0 4px 12px rgba(108, 92, 231, 0.2);
    }
  `]
})
export class AppHeaderComponent {
  @Input() title: string = '';
  @Input() backButton: boolean = false;
}
