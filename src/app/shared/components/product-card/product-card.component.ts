import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../models/product.model';
import { getStars } from '../../utils/rating.util';
import { getDiscountPercent } from '../../utils/price.util';

/**
 * @component ProductCardComponent
 * @description
 * Componente reutilizable que muestra la información de un producto en formato de tarjeta (card).
 * Se utiliza en el catálogo para presentar los productos disponibles de forma visual y atractiva.
 * 
 * **PATRÓN DE COMUNICACIÓN:**
 * - Recibe datos del componente padre mediante @Input() product
 * - Emite eventos al componente padre mediante @Output() add cuando el usuario agrega al carrito
 * 
 * **OPTIMIZACIÓN DE RENDIMIENTO:**
 * Utiliza ChangeDetectionStrategy.OnPush para mejorar el rendimiento:
 * - Angular solo revisa este componente cuando cambian las referencias de @Input()
 * - No se ejecuta detección de cambios en cada ciclo del framework
 * - Reduce drásticamente el número de revisiones (checks) en listas grandes de productos
 * - Importante: Para que funcione correctamente, el objeto product debe ser inmutable o
 *   reemplazarse por una nueva referencia cuando cambie (no mutar propiedades internas)
 * 
 * **FUNCIONALIDADES:**
 * - Muestra imagen del producto con navegación al detalle
 * - Calcula y muestra el porcentaje de descuento si existe previousPrice
 * - Renderiza estrellas de rating visual usando la utilidad getStars()
 * - Formatea precios en formato COP (pesos colombianos) sin decimales
 * - Botón de "Agregar al carrito" que emite evento al componente padre
 * - Navegación al detalle del producto mediante [routerLink]
 * 
 * @example
 * // En el template del componente padre (catalog.page.html):
 * <app-product-card
 *   *ngFor="let product of products"
 *   [product]="product"
 *   (add)="addToCart($event)">
 * </app-product-card>
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-card class="product-card shadow-card mode-ios">
      <div class="image-wrapper clickable" [routerLink]="['/product', product.id]">
        <ion-img [src]="product.imageUrl" [alt]="product.name"></ion-img>
        <div class="discount-badge" *ngIf="getDiscountPercent(product) as discount">
          -{{ discount }}%
        </div>
      </div>
      
      <ion-card-content>
        <div class="card-info clickable" [routerLink]="['/product', product.id]">
            <h3 class="product-title text-semibold">{{ product.name }}</h3>
        </div>

        <ion-button
          fill="clear"
          size="small"
          class="details-link"
          [routerLink]="['/product', product.id]">
          Ver producto
        </ion-button>

        <div class="price-row">
          <span class="current-price">{{ product.price | currency:'COP':'symbol':'1.0-0' }}</span>
          <span class="previous-price" *ngIf="product.previousPrice">
            {{ product.previousPrice | currency:'COP':'symbol':'1.0-0' }}
          </span>
        </div>

        <div class="rating-row" *ngIf="product.rating">
          <ion-icon
            *ngFor="let star of getStars(product.rating)"
            [name]="star"
            class="rating-star">
          </ion-icon>
          <span class="rating-value">{{ product.rating | number:'1.1-1' }}</span>
        </div>

        <ion-button expand="block" shape="round" color="primary" 
           (click)="onAdd()" class="ion-no-margin add-btn">
          <ion-icon name="cart-outline" slot="start"></ion-icon>
          Agregar
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .clickable {
      cursor: pointer;
    }
  `]
})
export class ProductCardComponent {
  /**
   * @property product
   * @description
   * Objeto Product recibido del componente padre (catalog.page.ts).
   * Contiene toda la información del producto a renderizar: id, nombre, precio, imagen, rating, etc.
   * 
   * **IMPORTANTE:** El operador '!' (non-null assertion) indica que este Input SIEMPRE debe
   * ser proporcionado por el componente padre. Si no se pasa, habrá un error en tiempo de ejecución.
   * 
   * @type {Product}
   * @required Sí, debe ser proporcionado por el componente padre
   */
  @Input() product!: Product;

  /**
   * @event add
   * @description
   * Evento que se emite cuando el usuario hace clic en el botón "Agregar al carrito".
   * El componente padre (catalog.page.ts) escucha este evento mediante (add)="addToCart($event)".
   * 
   * **FLUJO DE COMUNICACIÓN:**
   * 1. Usuario hace clic en botón "Agregar"
   * 2. Se ejecuta onAdd() en este componente
   * 3. Se emite this.add.emit(this.product) con el producto completo
   * 4. El componente padre recibe el producto en su método addToCart(product: Product)
   * 5. El padre puede agregar el producto al carrito usando CartService
   * 
   * @type {EventEmitter<Product>}
   * @emits Product - Emite el objeto completo del producto a agregar
   */
  @Output() add = new EventEmitter<Product>();

  /**
   * @method getStars
   * @description
   * Función utilitaria importada que convierte un número de rating (ej: 4.5) en un array
   * de nombres de iconos ('star', 'star-half', 'star-outline') para renderizar visualmente.
   */
  getStars = getStars;

  /**
   * @method getDiscountPercent
   * @description
   * Función que calcula el porcentaje de descuento comparando price y previousPrice.
   * Si no hay previousPrice, retorna null (no se muestra badge de descuento).
   */
  getDiscountPercent = (product: Product): number | null =>
    getDiscountPercent(product.price, product.previousPrice);

  /**
   * @method onAdd
   * @description
   * Método que se ejecuta cuando el usuario hace clic en el botón "Agregar al carrito".
   * Emite el evento 'add' con el producto completo para que el componente padre lo procese.
   * 
   * **PATRÓN DE COMUNICACIÓN HIJO → PADRE:**
   * Este es el patrón estándar en Angular para comunicación desde componente hijo hacia padre:
   * - El hijo (ProductCard) emite un evento con datos
   * - El padre (Catalog) escucha y procesa el evento
   * 
   * @returns {void}
   */
  onAdd(): void {
    this.add.emit(this.product);
  }

}
