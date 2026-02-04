import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product } from '../../models/product.model';
import { ProductRepository } from '../../repositories/product.repository';
import { environment } from 'src/environments/environment';

/**
 * Servicio de gestión de productos del catálogo.
 * 
 * Proporciona acceso al catálogo de productos desde un repositorio
 * (puede ser un archivo JSON local o una API externa).
 * 
 * Características:
 * - Carga de productos desde ProductRepository
 * - Fallback a datos hardcodeados si falla la carga
 * - Búsqueda de productos por ID
 * - Obtención de productos relacionados
 * - Logs solo en desarrollo (no en producción)
 * 
 * @example
 * constructor(private productService: ProductService) {}
 * 
 * // Obtener todos los productos
 * this.productService.getProducts().subscribe(products => {
 *   console.log('Catálogo:', products);
 * });
 * 
 * // Obtener un producto específico
 * this.productService.getProductById(1).subscribe(product => {
 *   console.log('Producto:', product);
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private repository: ProductRepository) { }

  /**
   * Obtiene la lista completa de productos del catálogo.
   * 
   * Si falla la carga desde el repositorio (por ejemplo, si products.json
   * no existe), devuelve un array hardcodeado de 3 productos como fallback.
   * 
   * @returns Observable con el array de productos
   * 
   * @example
   * this.productService.getProducts().subscribe({
   *   next: (products) => this.displayProducts(products),
   *   error: (err) => console.error('Error:', err)
   * });
   */
  getProducts(): Observable<Product[]> {
    return this.repository.getProducts().pipe(
      // Log solo en desarrollo para debugging
      tap(products => {
        if (!environment.production) {
          console.log('✅ Productos cargados exitosamente:', products.length);
        }
      }),
      catchError(err => {
        // Log del error solo en desarrollo
        if (!environment.production) {
          console.error('❌ Error cargando products.json, usando datos de respaldo:', err);
        }
        // Fallback data en caso de error de carga
        return of([
          {
            "id": 1,
            "name": "Lavadora LG Smart Inverter WT13DPBK 13Kg",
            "price": 1499900,
            "previousPrice": 1994900,
            "rating": 4.6,
            "description": "La Lavadora LG Smart Inverter WT13DPBK tiene un rendimiento de lavado superior, más limpio, más higiénico, El motor Smart Inverter es confiable, silencioso y duradero, ajusta la energía según la velocidad y la fuerza que requiere cada movimiento del tambor así controla con eficiencia el consumo energético.",
            "imageUrl": "assets/img/products/lavadora-lg-13kg.png",
            "images": [
              "assets/img/products/lavadora-lg-13kg.png",
              "assets/img/products/lavadora imagen 2.jpg",
              "assets/img/products/lavadora imagen 3.jpg"
            ],
            "features": [
              "Capacidad de lavado: 13 kg | 28 Lb",
              "Tipo de carga: Superior",
              "Color: Gris",
              "Panel digital: Sí",
              "Programas de lavado: 8",
              "Dimensiones: Ancho 52 cm, Alto 91.8 cm, Fondo 50 cm",
              "TurboDrum: Lavado poderoso",
              "Filtro atrapa motas",
              "Smart Diagnosis: Diagnóstico inteligente"
            ],
            "warranty": "Garantía de 12 meses por defectos de fábrica y/o daños internos directamente con la marca."
          },
          {
            "id": 2,
            "name": "Televisor Samsung 32\" T4300",
            "price": 760900,
            "previousPrice": 1011900,
            "rating": 4.4,
            "description": "Función One Remote: Maneja la interfaz de tu Smart TV y controla todos tus dispositivos. Alto Rango Dinámico HDR: La tecnología de Alto Rango Dinámico (HDR) optimiza la regulación de brillo. PurColor: Con la tecnología PurColor, puedes sentir tan cerca los contenidos. Visión ultranítida: Ofrece imágenes de alta calidad con menor distorsión. Acceso remoto: Haz el trabajo de la oficina en casa con tu televisor. Potenciador de contraste: Hace que tus imágenes se vean mucho más vivas.",
            "imageUrl": "assets/img/products/tv-samsung-32.png",
            "images": [
              "assets/img/products/tv-samsung-32.png",
              "assets/img/products/televiso 2.jpg",
              "assets/img/products/televiso 3.jpg"
            ],
            "features": [
              "Pantalla: 81 cm (32 Pulgadas)",
              "Resolución: HD Led",
              "Smart tv: Si, Tizen",
              "Audio: 10W",
              "Entradas: 2 HDMI, 1 USB"
            ],
            "warranty": "Garantía de 1 año directamente con la marca."
          },
          {
            "id": 3,
            "name": "Portátil Lenovo 14\" GL7 ICN4020/4Ram/128Gb/W11",
            "price": 879748,
            "previousPrice": 1169664,
            "rating": 4.5,
            "description": "Sube la vara de lo que se puede esperar de una laptop accesible con la IdeaPad 1i 7 ma Gen. Navega, explora y conéctate con confianza. Diseño extraordinariamente delgado. Pantalla hasta FHD de 14″ con un marco muy delgado. Sonido rico y claro Dolby Audio™.",
            "imageUrl": "assets/img/products/portatil-lenovo-14.png",
            "images": [
              "assets/img/products/portatil-lenovo-14.png",
              "assets/img/products/portatil 2.jpg",
              "assets/img/products/portatil 3.jpg"
            ],
            "features": [
              "Procesador: Intel Celeron N4020",
              "Pantalla: 14\" HD (1366x768)",
              "Memoria: 4 GB DDR4",
              "Disco: 128 GB SSD",
              "OS: Windows 11"
            ],
            "warranty": "Garantía de 12 meses directamente con la marca."
          }
        ]);
      })
    );
  }

  /**
   * Busca un producto específico por su ID.
   * 
   * @param productId - ID numérico del producto a buscar
   * @returns Observable con el producto encontrado o null si no existe
   * 
   * @example
   * this.productService.getProductById(1).subscribe(product => {
   *   if (product) {
   *     console.log('Encontrado:', product.name);
   *   } else {
   *     console.log('Producto no encontrado');
   *   }
   * });
   */
  getProductById(productId: number): Observable<Product | null> {
    return this.getProducts().pipe(
      // Buscar el producto en el array
      map(products => products.find(product => product.id === productId) ?? null)
    );
  }

  /**
   * Obtiene productos relacionados (todos excepto el producto actual).
   * Útil para mostrar recomendaciones en la página de detalle.
   * 
   * @param currentId - ID del producto actual a excluir
   * @returns Observable con array de productos relacionados
   * 
   * @example
   * this.productService.getRelatedProducts(1).subscribe(related => {
   *   console.log('Otros productos:', related);
   * });
   */
  getRelatedProducts(currentId: number): Observable<Product[]> {
    return this.getProducts().pipe(
      // Filtrar todos los productos excepto el actual
      map(products => products.filter(product => product.id !== currentId))
    );
  }
}
