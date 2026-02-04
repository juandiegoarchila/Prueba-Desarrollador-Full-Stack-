import { Component, Input } from '@angular/core';

/**
 * @component AppHeaderComponent
 * @description
 * Componente reutilizable que renderiza el header/toolbar superior de las páginas.
 * Proporciona un diseño consistente con título, botón de retroceso opcional y slot para botones adicionales.
 * 
 * **CONTENT PROJECTION (ng-content):**
 * Este componente utiliza <ng-content></ng-content> para permitir que el componente padre
 * inyecte contenido personalizado en el slot="end" del toolbar (esquina derecha).
 * 
 * **¿QUÉ ES CONTENT PROJECTION?**
 * Es un patrón de Angular que permite pasar contenido HTML desde el componente padre
 * al hijo, sin necesidad de usar @Input() para cada botón o elemento específico.
 * 
 * **VENTAJAS:**
 * - Flexibilidad: Cada página puede inyectar los botones que necesite (carrito, filtros, etc.)
 * - Reutilización: Un solo componente header sirve para todas las páginas
 * - Simplicidad: No necesitamos @Input() para cada posible configuración
 * 
 * @example
 * // Uso básico con solo título y botón de retroceso:
 * <app-header title="Catálogo" [backButton]="false"></app-header>
 * 
 * @example
 * // Uso avanzado con content projection (botón de carrito inyectado):
 * <app-header title="Productos" [backButton]="false">
 *   <ion-button [routerLink]="['/cart']">
 *     <ion-icon name="cart-outline"></ion-icon>
 *     <ion-badge color="danger">3</ion-badge>
 *   </ion-button>
 * </app-header>
 * // El contenido dentro de <app-header> se proyecta en <ng-content>
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
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
  /**
   * @property title
   * @description
   * Título principal que se muestra en el centro del toolbar.
   * Este texto usa la clase CSS 'text-semibold' para verse con peso semi-bold.
   * 
   * @type {string}
   * @default '' - String vacío si no se proporciona
   * @example
   * <app-header title="Mi Cuenta"></app-header>
   */
  @Input() title: string = '';

  /**
   * @property backButton
   * @description
   * Controla la visibilidad del botón de retroceso (ion-back-button) en la esquina izquierda.
   * - Si es true: Muestra ion-back-button que navega automáticamente a la página anterior
   * - Si es false: No muestra el botón (útil para páginas raíz como catalog)
   * 
   * **NAVEGACIÓN AUTOMÁTICA:**
   * ion-back-button de Ionic maneja automáticamente el stack de navegación,
   * pero si no hay historial, usa el defaultHref="/catalog" como fallback.
   * 
   * @type {boolean}
   * @default false - Por defecto no se muestra el botón
   * @example
   * // Página de detalle (debe permitir volver):
   * <app-header title="Detalle" [backButton]="true"></app-header>
   * 
   * // Página principal (no necesita volver):
   * <app-header title="Inicio" [backButton]="false"></app-header>
   */
  @Input() backButton: boolean = false;
}
