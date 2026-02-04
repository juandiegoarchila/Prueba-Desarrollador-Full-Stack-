import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';
import { getStars } from '../../shared/utils/rating.util';
import { getDiscountPercent } from '../../shared/utils/price.util';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * **Página de Detalle de Producto (ProductDetailPage)**
 * 
 * Muestra toda la información detallada de un producto individual incluyendo:
 * - Galería de imágenes con modal de zoom
 * - Precio, descuento y precio anterior
 * - Rating con estrellas
 * - Descripción completa
 * - Productos relacionados (misma categoría)
 * 
 * **Responsabilidades:**
 * - Cargar producto por ID desde URL params (/product-detail/:id)
 * - Mostrar galería de imágenes con thumbnails seleccionables
 * - Calcular porcentaje de descuento
 * - Renderizar estrellas de rating (getStars utility)
 * - Cargar productos relacionados (misma categoría)
 * - Permitir agregar al carrito desde detalle o desde productos relacionados
 * - Mostrar contador de items en carrito (badge en header)
 * 
 * **Flujo de navegación:**
 * 1. Usuario llega desde CatalogPage al hacer clic en un producto
 * 2. Se carga el producto por ID desde route.paramMap
 * 3. Se muestran detalles + productos relacionados
 * 4. Usuario puede:
 *    - Agregar producto al carrito (toast "Agregaste X al carrito")
 *    - Ver productos relacionados y agregarlos también
 *    - Hacer clic en imágenes para ver modal de zoom
 *    - Volver al catálogo con botón "Volver"
 * 
 * **Carga de productos relacionados:**
 * ProductService.getRelatedProducts(productId) devuelve productos de la misma
 * categoría excluyendo el producto actual. Se cargan DESPUÉS del producto principal
 * para no bloquear la UI.
 * 
 * **Galería de imágenes:**
 * - Si product.images[] existe: usar array de imágenes
 * - Si no: usar product.imageUrl como única imagen
 * - selectedImage almacena la imagen actualmente mostrada
 * - isImageModalOpen controla el modal de zoom
 * 
 * **Memory leak prevention:**
 * Implementa OnDestroy + takeUntil para cancelar las subscripciones a:
 * - route.paramMap (cambios de parámetro de ruta)
 * - productService.getProductById()
 * - productService.getRelatedProducts()
 * CRÍTICO porque esta página puede navegar entre productos sin destruirse
 * (usando productos relacionados), generando múltiples subscripciones activas.
 * 
 * **Optimización de UX:**
 * - No navega automáticamente al carrito después de agregar (permite seguir comprando)
 * - Muestra toast de éxito con nombre del producto agregado
 * - Mantiene estado de carga con isLoading
 * - Resetea selectedImage al cambiar de producto
 * 
 * @author Sistema Merpes
 * @version 1.0.0
 */
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss']
})
export class ProductDetailPage implements OnInit, OnDestroy {
  /** Producto actualmente mostrado (null durante carga inicial) */
  product: Product | null = null;

  /** Lista de productos de la misma categoría (excluyendo el actual) */
  relatedProducts: Product[] = [];

  /** Indica si está cargando el producto principal */
  isLoading = true;

  /** Porcentaje de descuento calculado (null si no hay descuento) */
  discountPercent: number | null = null;

  /** URL de la imagen actualmente seleccionada en la galería */
  selectedImage: string | null = null;

  /** Controla la visibilidad del modal de zoom de imagen */
  isImageModalOpen = false;

  /**
   * Observable del contador de items en el carrito.
   * Se expone para usar en el template con async pipe (badge en header).
   */
  cartItemCount$ = this.cartService.itemCount$;

  /**
   * Subject para implementar el patrón de limpieza de subscripciones.
   * Se emite un valor en ngOnDestroy() para cancelar todas las subscripciones
   * que usan takeUntil(destroy$).
   */
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notify: NotificationService,
    private nav: NavController
  ) {}

  /**
   * Función utilitaria para renderizar estrellas de rating.
   * Se expone para usar en el template.
   * @see rating.util.ts
   */
  getStars = getStars;

  /**
   * Carga el producto y productos relacionados al inicializar el componente.
   * 
   * **Flujo de carga:**
   * 1. Escuchar cambios en route.paramMap (paramMap es un Observable)
   * 2. Extraer productId de los parámetros (:id en la ruta)
   * 3. Validar que productId sea un número válido
   * 4. Llamar a productService.getProductById(productId)
   * 5. Calcular porcentaje de descuento con getDiscountPercent utility
   * 6. Inicializar selectedImage con la primera imagen disponible
   * 7. Cargar productos relacionados (misma categoría)
   * 
   * **Memory leak prevention:**
   * Usa takeUntil(destroy$) para cancelar subscripciones si el componente
   * se destruye antes de completar la carga.
   * 
   * **¿Por qué subscribirse a paramMap?**
   * Porque el usuario puede navegar entre productos usando productos relacionados
   * SIN destruir el componente. paramMap emitirá el nuevo ID y recargará el producto.
   * 
   * **Manejo de errores:**
   * - Si productId es inválido: isLoading = false (muestra empty-state)
   * - Si falla getProductById: isLoading = false (muestra error)
   * - Si falla getRelatedProducts: no bloquea (solo no muestra relacionados)
   */
  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$)) // Cancelar si el componente se destruye
      .subscribe(params => {
        const productId = Number(params.get('id'));

        if (!productId) {
          this.isLoading = false;
          return;
        }

        this.isLoading = true;
        this.selectedImage = null;

        this.productService.getProductById(productId)
          .pipe(takeUntil(this.destroy$)) // Cancelar si el componente se destruye
          .subscribe({
            next: (product) => {
              this.product = product;
              this.discountPercent = product
                ? getDiscountPercent(product.price, product.previousPrice)
                : null;
              
              // Inicializar imagen seleccionada
              if (this.product && this.product.images?.length) {
                this.selectedImage = this.product.images[0];
              } else if (this.product) {
                this.selectedImage = this.product.imageUrl;
              }

              this.isLoading = false;

              // Cargar productos relacionados (misma categoría)
              if (this.product) {
                this.productService.getRelatedProducts(this.product.id)
                  .pipe(takeUntil(this.destroy$)) // Cancelar si el componente se destruye
                  .subscribe(related => {
                    this.relatedProducts = related;
                  });
              }
            },
            error: () => {
              this.isLoading = false;
            }
          });
      });
  }

  /**
   * Agrega un producto al carrito y muestra toast de confirmación.
   * 
   * **Flujo:**
   * 1. Determinar producto objetivo (parámetro product o this.product)
   * 2. Validar que exista el producto
   * 3. Llamar a CartService.addToCart(product) que:
   *    - Si el producto YA está en el carrito: incrementa quantity
   *    - Si NO está: lo agrega con quantity = 1
   *    - Calcula total automáticamente
   *    - Guarda en LocalStorage
   * 4. Mostrar toast "Agregaste {nombre} al carrito"
   * 5. NO navegar al carrito (permitir seguir comprando)
   * 
   * **¿Por qué recibe product opcional?**
   * Porque este método se usa en 2 contextos:
   * - Botón "Agregar al Carrito" del producto principal (sin parámetro)
   * - Botones de productos relacionados (con parámetro product)
   * 
   * @param product Producto a agregar (opcional, usa this.product si no se pasa)
   */
  addToCart(product?: Product) {
    const targetProduct = product || this.product;
    if (!targetProduct) {
      return;
    }
    this.cartService.addToCart(targetProduct);
    this.notify.showSuccess(`Agregaste ${targetProduct.name} al carrito`);
    // No navegar al carrito automáticamente para permitir seguir comprando
  }

  /**
   * Navega de vuelta al catálogo de productos.
   * Usa navigateBack para mantener el historial de navegación.
   */
  goToCatalog() {
    this.nav.navigateBack('/catalog');
  }

  /**
   * Hook de destrucción que limpia las subscripciones.
   * Cancela todas las subscripciones activas (paramMap, getProductById, getRelatedProducts)
   * para prevenir memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
