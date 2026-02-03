import { Component } from '@angular/core';

@Component({
  selector: 'app-confirm',
  template: `
    <ion-content class="ion-padding ion-text-center">
      <div class="container">
        <ion-icon name="checkmark-circle-outline" color="success" size="large" style="font-size: 100px;"></ion-icon>
        <h1>¡Compra Exitosa!</h1>
        <p>Tu pedido ha sido registrado correctamente.</p>
        
        <ion-button routerLink="/catalog" expand="block" shape="round" class="ion-margin-top">
          Seguir Comprando
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        align-items: center;
    }
  `]
})
export class ConfirmPage {}
