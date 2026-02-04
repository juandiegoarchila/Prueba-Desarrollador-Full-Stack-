/**
 * @interface Product
 * @description
 * Modelo que representa un producto del catálogo de e-commerce.
 * Define toda la información necesaria para mostrar y vender un producto.
 * 
 * **FUENTE DE DATOS:**
 * Los productos se cargan desde ProductService, que puede obtenerlos de:
 * - Firebase Firestore (si useFirebase = true)
 * - Archivo JSON local en assets/data/products.json (modo offline)
 * 
 * **USO EN LA APLICACIÓN:**
 * - Catálogo: Lista todos los productos disponibles
 * - Detalle: Muestra información completa de un producto específico
 * - Carrito: Los CartItem contienen la referencia completa al Product
 * - Órdenes: Las órdenes almacenan los productos comprados
 * 
 * @example
 * const producto: Product = {
 *   id: 1,
 *   name: 'Laptop HP Pavilion 15',
 *   price: 2500000,
 *   previousPrice: 3000000,
 *   discountPercent: 17,
 *   rating: 4.5,
 *   description: 'Laptop potente para trabajo y estudio...',
 *   imageUrl: 'assets/img/laptop-hp.jpg',
 *   images: ['img1.jpg', 'img2.jpg'],
 *   features: ['Intel i7', '16GB RAM', 'SSD 512GB'],
 *   warranty: '1 año de garantía'
 * };
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
export interface Product {
    /**
     * @property id
     * @description
     * Identificador único del producto.
     * Se usa para navegar al detalle mediante [routerLink]="['/product', product.id]".
     * 
     * @type {number}
     * @required
     * @example 1, 2, 3...
     */
    id: number;

    /**
     * @property name
     * @description
     * Nombre descriptivo del producto, mostrado en cards y detalle.
     * 
     * @type {string}
     * @required
     * @example 'Laptop HP Pavilion 15' | 'Mouse Logitech MX Master'
     */
    name: string;

    /**
     * @property price
     * @description
     * Precio actual del producto en pesos colombianos (COP).
     * Este es el precio de venta real que se usa para calcular el total del carrito.
     * 
     * **FORMATO:** Número sin decimales (ej: 2500000 = $2,500,000 COP)
     * 
     * @type {number}
     * @required
     * @example 2500000 // $2,500,000 COP
     */
    price: number;

    /**
     * @property previousPrice
     * @description
     * Precio anterior del producto (antes del descuento).
     * Si existe y es mayor que price, se muestra tachado y se calcula el porcentaje de descuento.
     * 
     * **USO:**
     * - ProductCard muestra previousPrice tachado si existe
     * - Se calcula el badge de descuento: getDiscountPercent(price, previousPrice)
     * 
     * @type {number | undefined}
     * @optional
     * @example 3000000 // Precio original antes del descuento
     */
    previousPrice?: number;

    /**
     * @property discountPercent
     * @description
     * Porcentaje de descuento precalculado (0-100).
     * Normalmente se calcula dinámicamente con getDiscountPercent(), pero puede venir precalculado.
     * 
     * @type {number | undefined}
     * @optional
     * @deprecated Preferir calcular dinámicamente con getDiscountPercent(price, previousPrice)
     * @example 17 // 17% de descuento
     */
    discountPercent?: number;

    /**
     * @property rating
     * @description
     * Calificación del producto en escala de 0 a 5 estrellas.
     * Se usa con getStars(rating) para renderizar estrellas visuales.
     * 
     * **RANGO:** 0.0 a 5.0 (permite decimales para media estrella)
     * 
     * @type {number | undefined}
     * @optional
     * @example 4.5 // 4 estrellas y media
     */
    rating?: number;

    /**
     * @property description
     * @description
     * Descripción detallada del producto, mostrada en la página de detalle.
     * Puede incluir especificaciones técnicas, beneficios, usos, etc.
     * 
     * @type {string}
     * @required
     * @example 'Laptop potente con procesador Intel i7 de 11va generación...'
     */
    description: string;

    /**
     * @property imageUrl
     * @description
     * URL de la imagen principal del producto.
     * Esta imagen se muestra en el ProductCard (catálogo) y en el detalle.
     * 
     * **RUTAS:**
     * - Locales: 'assets/img/producto.jpg'
     * - Remotas: 'https://cdn.ejemplo.com/imagen.jpg'
     * 
     * @type {string}
     * @required
     * @example 'assets/img/laptop-hp.jpg'
     */
    imageUrl: string;

    /**
     * @property images
     * @description
     * Array de URLs de imágenes adicionales del producto.
     * Se pueden mostrar en un carousel/slider en la página de detalle.
     * 
     * @type {string[] | undefined}
     * @optional
     * @example ['assets/img/laptop-1.jpg', 'assets/img/laptop-2.jpg']
     */
    images?: string[];

    /**
     * @property features
     * @description
     * Lista de características o especificaciones del producto.
     * Se muestran como bullets en la página de detalle.
     * 
     * @type {string[] | undefined}
     * @optional
     * @example ['Intel Core i7 11va Gen', '16GB RAM DDR4', 'SSD 512GB NVMe']
     */
    features?: string[];

    /**
     * @property warranty
     * @description
     * Información sobre la garantía del producto.
     * 
     * @type {string | undefined}
     * @optional
     * @example '1 año de garantía del fabricante' | '6 meses de garantía'
     */
    warranty?: string;
}
