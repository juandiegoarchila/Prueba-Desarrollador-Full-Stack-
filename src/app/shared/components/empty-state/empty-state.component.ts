import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * @component EmptyStateComponent
 * @description
 * Componente reutilizable que muestra un estado vacío (empty state) con un diseño consistente.
 * Se utiliza cuando no hay datos que mostrar: carrito vacío, sin órdenes, búsqueda sin resultados, etc.
 * 
 * **PATRÓN DE DISEÑO UX:**
 * Un "empty state" es una interfaz que se muestra cuando una página/sección no tiene contenido.
 * En lugar de dejar un espacio en blanco confuso, se muestra:
 * - Un ícono visual (en un círculo gris)
 * - Un título descriptivo
 * - Un mensaje explicativo
 * - Opcionalmente, un botón de acción (ej: "Ir al catálogo")
 * 
 * **MEJORA LA EXPERIENCIA DE USUARIO:**
 * - Evita la sensación de página "rota" o vacía
 * - Guía al usuario sobre qué hacer (call-to-action)
 * - Mantiene consistencia visual en toda la app
 * 
 * **FLEXIBILIDAD:**
 * Todos los textos e ícono son configurables mediante @Input(), permitiendo
 * personalizar el mensaje para cada contexto específico.
 * 
 * @example
 * // Carrito vacío:
 * <app-empty-state
 *   title="Carrito vacío"
 *   description="No tienes productos en tu carrito aún"
 *   icon="cart-outline"
 *   actionText="Ir al catálogo"
 *   (action)="goToCatalog()">
 * </app-empty-state>
 * 
 * @example
 * // Sin resultados de búsqueda:
 * <app-empty-state
 *   title="Sin resultados"
 *   description="No encontramos productos con ese nombre"
 *   icon="search-outline">
 * </app-empty-state>
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
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
  /**
   * @property title
   * @description
   * Título principal del estado vacío, mostrado en negrita y centrado.
   * Debe ser corto y descriptivo del estado actual.
   * 
   * @type {string}
   * @default 'No hay datos'
   * @example title="Carrito vacío"
   */
  @Input() title: string = 'No hay datos';

  /**
   * @property description
   * @description
   * Mensaje descriptivo más detallado que explica por qué no hay datos o qué puede hacer el usuario.
   * Se muestra debajo del título con color gris (ion-color-medium).
   * 
   * @type {string}
   * @default 'No hemos encontrado información para mostrar aquí.'
   * @example description="Agrega productos desde el catálogo para comenzar"
   */
  @Input() description: string = 'No hemos encontrado información para mostrar aquí.';

  /**
   * @property icon
   * @description
   * Nombre del ícono de Ionicons a mostrar en el círculo superior.
   * El ícono se renderiza en un círculo gris de 80x80px para consistencia visual.
   * 
   * **ICONOS COMUNES:**
   * - 'cart-outline': Carrito vacío
   * - 'search-outline': Sin resultados de búsqueda
   * - 'receipt-outline': Sin órdenes
   * - 'cube-outline': Sin productos
   * 
   * @type {string}
   * @default 'search-outline'
   * @see https://ionic.io/ionicons - Catálogo completo de íconos
   */
  @Input() icon: string = 'search-outline';

  /**
   * @property actionText
   * @description
   * Texto del botón de acción (call-to-action).
   * Si se proporciona, se muestra un botón secundario que emite el evento 'action' al hacer clic.
   * Si es undefined, no se renderiza ningún botón (usando *ngIf en el template).
   * 
   * **USO CONDICIONAL:**
   * - Definir actionText SOLO si hay una acción clara que el usuario pueda tomar
   * - Ej: "Ir al catálogo" cuando el carrito está vacío
   * - No definir actionText si no hay acción posible (ej: sin resultados de búsqueda)
   * 
   * @type {string | undefined}
   * @optional
   * @example actionText="Ver productos"
   */
  @Input() actionText?: string;

  /**
   * @event action
   * @description
   * Evento que se emite cuando el usuario hace clic en el botón de acción.
   * El componente padre debe escuchar este evento para ejecutar la navegación o lógica correspondiente.
   * 
   * **IMPORTANTE:** Este evento solo se emite si actionText está definido (el botón solo se muestra en ese caso).
   * 
   * @type {EventEmitter<void>}
   * @emits void - No emite datos, solo notifica que se hizo clic
   * @example
   * // En el template del componente padre:
   * <app-empty-state actionText="Ir al catálogo" (action)="goToCatalog()">
   * </app-empty-state>
   * 
   * // En la clase del componente padre:
   * goToCatalog() {
   *   this.router.navigate(['/catalog']);
   * }
   */
  @Output() action = new EventEmitter<void>();
}
