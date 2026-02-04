import { Component } from '@angular/core';

/**
 * **Página de Confirmación de Pedido (ConfirmPage)**
 * 
 * Pantalla de éxito que se muestra después de completar un pedido exitosamente.
 * 
 * **Responsabilidades:**
 * - Mostrar mensaje de confirmación visual con ícono de éxito
 * - Permitir al usuario regresar al catálogo para seguir comprando
 * - Proporcionar feedback positivo de que el pedido se procesó correctamente
 * 
 * **Flujo de navegación:**
 * 1. Usuario llega aquí desde CartPage después de checkout exitoso
 * 2. Ve mensaje "¡Compra Exitosa!" con ícono verde de checkmark
 * 3. Puede hacer clic en "Seguir Comprando" para volver a /catalog
 * 
 * **Características:**
 * - Diseño centrado y minimalista (ion-text-center)
 * - Ícono grande de éxito (checkmark-circle-outline, 100px)
 * - Botón redondeado con routerLink directo (sin lógica TypeScript)
 * - Flex layout vertical centrado (justify-content: center)
 * 
 * **Nota sobre subscripciones:**
 * Este componente es completamente estático (inline template sin lógica),
 * por lo tanto NO requiere implementar OnDestroy ni memory leak prevention.
 * No hay subscripciones, observables ni async pipes que limpiar.
 * 
 * @author Sistema Merpes
 * @version 1.0.0
 */
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
