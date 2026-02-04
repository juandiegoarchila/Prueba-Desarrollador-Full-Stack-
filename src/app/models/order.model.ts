import { CartItem } from './cart-item.model';

/**
 * @interface Order
 * @description
 * Modelo que representa una orden/pedido realizado por un usuario.
 * Una orden se crea cuando el usuario confirma la compra en el carrito.
 * 
 * **CICLO DE VIDA DE UNA ORDEN:**
 * 1. El usuario agrega productos al carrito (CartItem[])
 * 2. Hace clic en "Finalizar Compra" en cart.page.ts
 * 3. Se crea una Order con status='pending' y se guarda localmente
 * 4. Si useFirebase=true, se sincroniza con Firestore → status='synced'
 * 5. El usuario puede ver sus órdenes en orders.page.ts
 * 6. (Futuro) El administrador marca como 'completed' cuando se entrega
 * 
 * **ESTRATEGIA OFFLINE-FIRST:**
 * - Las órdenes se crean y guardan SIEMPRE localmente primero (status='pending')
 * - Si hay conexión y useFirebase=true, se sincronizan automáticamente
 * - Si no hay conexión, quedan como 'pending' y se sincronizan después
 * - Esto garantiza que el usuario nunca pierda una orden por problemas de red
 * 
 * **PERSISTENCIA:**
 * - Local: Ionic Storage con clave 'orders' → Order[]
 * - Remota: Firebase Firestore colección 'orders'
 * 
 * @example
 * const order: Order = {
 *   id: 'order-uuid-abc123',
 *   userId: 'user-xyz789',
 *   items: [
 *     { product: {...}, quantity: 2, total: 5000000 },
 *     { product: {...}, quantity: 1, total: 1200000 }
 *   ],
 *   total: 6200000,
 *   date: new Date('2026-02-04T10:30:00'),
 *   status: 'synced'
 * };
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
export interface Order {
    /**
     * @property id
     * @description
     * Identificador único de la orden.
     * Se genera automáticamente al crear la orden usando crypto.randomUUID() o similar.
     * 
     * **FORMATO:** UUID v4 o timestamp-based unique ID
     * 
     * @type {string}
     * @required
     * @example 'order-1707048600000-abc123' | 'uuid-v4-generated'
     */
    id: string;

    /**
     * @property userId
     * @description
     * ID del usuario que realizó la orden.
     * Relaciona la orden con el usuario mediante User.uid.
     * 
     * **USO:**
     * - Al crear orden: Se obtiene de auth.currentUser$.value?.uid
     * - Al listar órdenes: Se filtran las del usuario actual
     * - Permite consultar historial de compras por usuario
     * 
     * @type {string}
     * @required
     * @example 'firebase-user-abc123' | 'local-user-xyz789'
     */
    userId: string;

    /**
     * @property items
     * @description
     * Array de productos incluidos en la orden.
     * Cada item contiene el producto completo, cantidad y total calculado.
     * 
     * **IMPORTANTE:**
     * Los items se copian del carrito al momento de confirmar la compra.
     * Si los precios cambian después, la orden mantiene los precios originales.
     * 
     * @type {CartItem[]}
     * @required
     * @minItems 1 - Una orden debe tener al menos un producto
     * @example
     * [
     *   { product: {...}, quantity: 2, total: 5000000 },
     *   { product: {...}, quantity: 1, total: 1200000 }
     * ]
     */
    items: CartItem[];

    /**
     * @property total
     * @description
     * Monto total de la orden en pesos colombianos (COP).
     * Se calcula sumando el total de todos los items: sum(item.total).
     * 
     * **CÁLCULO:**
     * ```typescript
     * const total = items.reduce((sum, item) => sum + item.total, 0);
     * ```
     * 
     * **NOTA:** Este total ya incluye IVA del 19% (los precios en Product incluyen IVA).
     * 
     * @type {number}
     * @required
     * @example 6200000 // $6,200,000 COP
     */
    total: number;

    /**
     * @property date
     * @description
     * Fecha y hora en que se creó la orden.
     * Se usa para mostrar el historial ordenado cronológicamente (más reciente primero).
     * 
     * **IMPORTANTE:**
     * - Al crear: Se asigna new Date() al momento de confirmar compra
     * - Al guardar en Storage: Se serializa a ISO string
     * - Al recuperar: Se convierte de string a Date object
     * 
     * @type {Date}
     * @required
     * @example new Date('2026-02-04T10:30:00.000Z')
     */
    date: Date;

    /**
     * @property status
     * @description
     * Estado actual de la orden en el flujo de procesamiento.
     * 
     * **ESTADOS POSIBLES:**
     * 
     * - **'pending'**: Orden creada localmente, aún no sincronizada con el servidor.
     *   Ocurre cuando:
     *   - useFirebase = false (modo solo local)
     *   - No hay conexión a internet
     *   - Error temporal al sincronizar
     * 
     * - **'synced'**: Orden sincronizada exitosamente con Firebase Firestore.
     *   Significa que la orden está respaldada en la nube y visible para administradores.
     * 
     * - **'completed'**: Orden completada/entregada al usuario.
     *   Estado final del ciclo de vida (futuro: marcado por administrador).
     * 
     * **FLUJO NORMAL:**
     * pending → synced → completed
     * 
     * **USO EN UI:**
     * - orders.page.ts muestra badges de color según status
     * - Se pueden filtrar órdenes por estado
     * 
     * @type {'pending' | 'synced' | 'completed'}
     * @required
     * @default 'pending' - Al crear una nueva orden
     */
    status: 'pending' | 'synced' | 'completed';
}
