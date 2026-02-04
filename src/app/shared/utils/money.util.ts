/**
 * @function formatMoney
 * @description
 * Formatea un número como moneda en pesos colombianos (COP) con formato localizado.
 * Utiliza la API Intl.NumberFormat del navegador para formateo internacional estándar.
 * 
 * **¿QUÉ HACE?**
 * Convierte un número plano (ej: 2500000) en un string formateado con separadores de miles
 * y símbolo de moneda (ej: "$ 2.500.000").
 * 
 * **CONFIGURACIÓN:**
 * - Locale: 'es-CO' (español de Colombia)
 * - Currency: 'COP' (pesos colombianos)
 * - minimumFractionDigits: 0 (sin decimales, porque COP no usa centavos)
 * 
 * **VENTAJAS DE Intl.NumberFormat:**
 * - Respeta convenciones locales (separador de miles con punto en Colombia)
 * - Maneja automáticamente el símbolo de moneda
 * - Funciona en todos los navegadores modernos
 * - Más eficiente que manipulación manual de strings
 * 
 * **ALTERNATIVA EN TEMPLATES:**
 * En los templates también se puede usar el pipe de Angular:
 * ```html
 * {{ product.price | currency:'COP':'symbol':'1.0-0' }}
 * ```
 * Esta función es útil cuando se necesita formatear en TypeScript (no en template).
 * 
 * @param {number} amount - Monto a formatear (en pesos, sin decimales)
 * @returns {string} String formateado como moneda COP
 * 
 * @example
 * formatMoney(2500000)   // "$ 2.500.000"
 * formatMoney(150000)    // "$ 150.000"
 * formatMoney(1000)      // "$ 1.000"
 * formatMoney(0)         // "$ 0"
 * 
 * @example
 * // Uso en código TypeScript:
 * const totalFormatted = formatMoney(this.cartTotal);
 * console.log(`Total a pagar: ${totalFormatted}`);
 * // Output: "Total a pagar: $ 2.500.000"
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat|Intl.NumberFormat}
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
export const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency',           // Formato de moneda (agrega símbolo)
        currency: 'COP',              // Pesos colombianos
        minimumFractionDigits: 0      // Sin decimales (COP no usa centavos)
    }).format(amount);
};
