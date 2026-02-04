/**
 * @function getStars
 * @description
 * Convierte un número de rating (0-5) en un array de nombres de iconos de Ionicons
 * para renderizar una representación visual de estrellas de calificación.
 * 
 * **¿QUÉ HACE?**
 * Dado un rating como 4.5, retorna: ['star', 'star', 'star', 'star', 'star-half']
 * Estos nombres se usan con <ion-icon name="..."> para mostrar las estrellas.
 * 
 * **ALGORITMO:**
 * 1. Normaliza el rating al rango 0-5 usando Math.max/Math.min
 * 2. Calcula estrellas completas: Math.floor(rating)
 * 3. Verifica si hay media estrella: decimal >= 0.5
 * 4. Rellena con estrellas vacías hasta completar 5
 * 
 * **ICONOS DE IONICONS:**
 * - 'star': Estrella completa (llena)
 * - 'star-half': Media estrella
 * - 'star-outline': Estrella vacía (solo contorno)
 * 
 * @param {number} rating - Calificación del producto (normalmente entre 0 y 5)
 * @returns {string[]} Array de 5 nombres de iconos para renderizar
 * 
 * @example
 * getStars(4.5)  // ['star', 'star', 'star', 'star', 'star-half']
 * getStars(3.2)  // ['star', 'star', 'star', 'star-outline', 'star-outline']
 * getStars(5.0)  // ['star', 'star', 'star', 'star', 'star']
 * getStars(0.0)  // ['star-outline', 'star-outline', 'star-outline', 'star-outline', 'star-outline']
 * getStars(3.7)  // ['star', 'star', 'star', 'star-half', 'star-outline']
 * 
 * @example
 * // Uso en template (product-card.component.ts):
 * <ion-icon
 *   *ngFor="let star of getStars(product.rating)"
 *   [name]="star"
 *   class="rating-star">
 * </ion-icon>
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
export const getStars = (rating: number): string[] => {
  // Normalizar rating al rango 0-5 (protección contra valores fuera de rango)
  const safeRating = Math.max(0, Math.min(5, rating));
  
  // Calcular número de estrellas completas (ej: 4.5 → 4 estrellas completas)
  const fullStars = Math.floor(safeRating);
  
  // Verificar si hay media estrella (ej: 4.5 → 0.5 >= 0.5 → true)
  const hasHalf = safeRating - fullStars >= 0.5;
  
  // Array resultado que contendrá los 5 nombres de iconos
  const stars: string[] = [];

  // Agregar estrellas completas
  for (let i = 0; i < fullStars; i += 1) {
    stars.push('star');
  }

  // Agregar media estrella si aplica
  if (hasHalf) {
    stars.push('star-half');
  }

  // Rellenar con estrellas vacías hasta completar 5
  while (stars.length < 5) {
    stars.push('star-outline');
  }

  // Retornar siempre array de exactamente 5 elementos
  return stars;
};
