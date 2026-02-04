import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-container ion-padding">
      <div class="icon-circle">
        <ion-icon [name]="icon" color="medium"></ion-icon>
      </div>
      <h3 class="text-bold ion-text-center">{{ title }}</h3>
      <p class="ion-text-center ion-text-wrap text-medium">{{ description }}</p>
      
      <ion-button *ngIf="actionText" (click)="action.emit()" 
        color="secondary" shape="round" class="ion-margin-top">
        {{ actionText }}
      </ion-button>
    </div>
  `,
  styles: [`
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      background: var(--ion-color-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    ion-icon {
      font-size: 40px;
    }
    h3 {
      color: var(--ion-color-tertiary);
      margin: 0 0 10px;
    }
    p {
      color: var(--ion-color-medium);
      max-width: 80%;
      margin: 0;
    }
  `]
})
export class EmptyStateComponent {
  @Input() title: string = 'No hay datos';
  @Input() description: string = 'No hemos encontrado información para mostrar aquí.';
  @Input() icon: string = 'search-outline';
  @Input() actionText?: string;
  @Output() action = new EventEmitter<void>();
}
