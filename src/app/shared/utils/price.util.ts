/**
 * @function getDiscountPercent
 * @description
 * Calcula el porcentaje de descuento entre un precio anterior y el precio actual.
 * Se usa para mostrar badges de descuento (ej: "-17%") en las tarjetas de producto.
 * 
 * **¿QUÉ HACE?**
 * Compara el precio actual con el precio anterior y calcula qué porcentaje se ahorró.
 * Si no hay descuento real, retorna null (no se muestra el badge).
 * 
 * **FÓRMULA:**
 * ```
 * descuento = (1 - precioActual / precioAnterior) * 100
 * ```
 * 
 * **EJEMPLO DE CÁLCULO:**
 * - Precio anterior: $3,000,000
 * - Precio actual: $2,500,000
 * - Descuento: (1 - 2500000/3000000) * 100 = 16.67% → redondeado a 17%
 * 
 * **CASOS ESPECIALES:**
 * - Si previousPrice no existe (undefined): retorna null → no hay descuento
 * - Si previousPrice <= price: retorna null → no es un descuento real
 * - Si el resultado es 0% o negativo: retorna null → no mostrar
 * 
 * @param {number} price - Precio actual del producto (precio de venta)
 * @param {number | undefined} previousPrice - Precio anterior (antes del descuento), opcional
 * @returns {number | null} Porcentaje de descuento redondeado, o null si no hay descuento
 * 
 * @example
 * getDiscountPercent(2500000, 3000000)  // 17 (17% de descuento)
 * getDiscountPercent(1000000, 1500000)  // 33 (33% de descuento)
 * getDiscountPercent(2000000, undefined) // null (no hay previousPrice)
 * getDiscountPercent(3000000, 2000000)  // null (precio aumentó, no hay descuento)
 * getDiscountPercent(1000000, 1000000)  // null (sin cambio de precio)
 * 
 * @example
 * // Uso en product-card.component.ts:
 * <div class="discount-badge" *ngIf="getDiscountPercent(product) as discount">
 *   -{{ discount }}%
 * </div>
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
export const getDiscountPercent = (price: number, previousPrice?: number): number | null => {
  // Validar que previousPrice existe y es mayor que el precio actual
  if (!previousPrice || previousPrice <= price) {
    return null; // No hay descuento válido
  }

  // Calcular porcentaje de descuento y redondear
  // Fórmula: (1 - precioActual/precioAnterior) * 100
  const discount = Math.round((1 - price / previousPrice) * 100);
  
  // Solo retornar si el descuento es positivo
  return discount > 0 ? discount : null;
};
