import { Product } from './product.model';

/**
 * @interface CartItem
 * @description
 * Modelo que representa un producto agregado al carrito de compras.
 * Combina la información del producto (Product) con la cantidad seleccionada y el total calculado.
 * 
 * **RELACIÓN CON PRODUCT:**
 * Cada CartItem contiene la referencia completa al objeto Product.
 * Esto permite acceder a toda la información (nombre, precio, imagen) sin consultas adicionales.
 * 
 * **CÁLCULO DEL TOTAL:**
 * El campo 'total' se calcula como: product.price * quantity
 * Este cálculo se realiza en CartService al agregar o actualizar cantidades.
 * 
 * **PERSISTENCIA:**
 * Los CartItems se guardan en Ionic Storage (localStorage) mediante:
 * - Clave: 'cart'
 * - Valor: CartItem[] (array serializado a JSON)
 * 
 * **USO EN LA APLICACIÓN:**
 * - CartService mantiene items$ (BehaviorSubject<CartItem[]>)
 * - cart.page.ts renderiza la lista de items con *ngFor
 * - Se pueden modificar cantidades o eliminar items
 * - Al confirmar compra, los items se convierten en Order
 * 
 * @example
 * const cartItem: CartItem = {
 *   product: {
 *     id: 1,
 *     name: 'Laptop HP',
 *     price: 2500000,
 *     description: '...',
 *     imageUrl: 'assets/img/laptop.jpg'
 *   },
 *   quantity: 2,
 *   total: 5000000  // 2500000 * 2
 * };
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
export interface CartItem {
    /**
     * @property product
     * @description
     * Objeto completo del producto agregado al carrito.
     * Contiene toda la información necesaria para mostrar en cart.page.ts:
     * nombre, precio, imagen, descripción, etc.
     * 
     * **IMPORTANTE:** Se almacena el objeto completo (no solo el ID) para:
     * - Evitar consultas adicionales al ProductService al cargar el carrito
     * - Mantener el precio original aunque cambie en el catálogo
     * - Funcionar en modo offline sin necesidad de sincronizar
     * 
     * @type {Product}
     * @required
     */
    product: Product;

    /**
     * @property quantity
     * @description
     * Cantidad de unidades del producto agregadas al carrito.
     * Debe ser un número entero positivo (mínimo 1).
     * 
     * **VALIDACIÓN:**
     * - Al agregar: Se valida quantity >= 1
     * - Al actualizar: Se permite disminuir hasta 1
     * - Si quantity = 0: Se elimina el item del carrito
     * 
     * **CONTROL EN UI:**
     * Se usan botones +/- en cart.page.ts para modificar la cantidad.
     * 
     * @type {number}
     * @required
     * @minimum 1
     * @example 2 // 2 unidades del producto
     */
    quantity: number;

    /**
     * @property total
     * @description
     * Total calculado para este item específico: product.price * quantity.
     * Este valor se precalcula y almacena para evitar recalcular constantemente.
     * 
     * **CÁLCULO:**
     * ```typescript
     * const total = item.product.price * item.quantity;
     * ```
     * 
     * **USO:**
     * - Se suma en CartService para obtener el total del carrito: total$
     * - Se muestra en cart.page.ts para cada item
     * - Se incluye en el resumen de la orden
     * 
     * @type {number}
     * @required
     * @example 5000000 // Si price=2500000 y quantity=2
     */
    total: number;
}
