import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

/**
 * Guard de autenticación para proteger rutas que requieren usuario logueado.
 * 
 * **Problema que resuelve:**
 * Cuando la app arranca, Firebase Auth tarda ~100-300ms en verificar si hay sesión.
 * Si el guard se ejecuta ANTES de que Firebase responda, no sabe si hay usuario o no,
 * y puede redirigir incorrectamente al login aunque el usuario SÍ esté logueado.
 * 
 * **Solución - Flujo de operadores RxJS:**
 * ```
 * authStateReady$ ──filter(true)──> take(1) ──switchMap──> currentUser$ ──map──> boolean
 *      ↓                              ↓                        ↓              ↓
 *   [false]                       Espera                   [User|null]    true/false
 *   [false]                         ↓                          ↓
 *   [true] ────────────────────> Continúa ──────────────> Verifica ──> Resultado
 * ```
 * 
 * **Explicación paso a paso:**
 * 
 * 1. **authStateReady$** (BehaviorSubject<boolean>)
 *    - Empieza en `false` cuando la app arranca
 *    - Cambia a `true` cuando Firebase responde (en AuthService.checkSession)
 *    - Indica: "Ya sé si hay usuario o no (aunque sea null)"
 * 
 * 2. **filter(ready => ready)** - Operador RxJS
 *    - BLOQUEA todas las emisiones donde ready === false
 *    - DEJA PASAR solo cuando ready === true
 *    - Efecto: El guard ESPERA a que Firebase esté listo antes de continuar
 * 
 * 3. **take(1)** - Operador RxJS
 *    - Toma SOLO la primera emisión que pase el filter
 *    - Completa el observable automáticamente
 *    - Efecto: Evita múltiples ejecuciones, solo necesitamos una verificación
 * 
 * 4. **switchMap(() => this.auth.currentUser$)** - Operador RxJS
 *    - CAMBIA de observable: de authStateReady$ a currentUser$
 *    - Descarta el valor de authStateReady$ (ya no lo necesitamos)
 *    - Empieza a escuchar currentUser$ (Observable<User | null>)
 *    - Efecto: Ahora tenemos acceso al usuario actual
 * 
 * 5. **map(user => ...)** - Operador RxJS
 *    - TRANSFORMA el valor de User | null a boolean
 *    - Si user existe → return true (permitir acceso)
 *    - Si user es null → redirigir a /login y return false (bloquear acceso)
 * 
 * **Ejemplo de flujo temporal:**
 * ```
 * t=0ms:   Usuario navega a /tabs/home
 * t=1ms:   AuthGuard.canActivate() se ejecuta
 * t=2ms:   authStateReady$ emite false → filter() BLOQUEA
 * t=50ms:  authStateReady$ emite false → filter() BLOQUEA
 * t=150ms: Firebase responde → authStateReady$ emite true → filter() DEJA PASAR
 * t=151ms: take(1) toma el true y completa
 * t=152ms: switchMap() cambia a currentUser$
 * t=153ms: currentUser$ emite User { uid: "abc", email: "user@example.com", ... }
 * t=154ms: map() transforma User a true
 * t=155ms: Guard devuelve true → Navegación permitida ✅
 * ```
 * 
 * **Sin este guard (problemático):**
 * ```typescript
 * // ❌ MAL - Se ejecuta antes de que Firebase responda
 * canActivate() {
 *   const user = this.auth.currentUserValue; // null (porque Firebase no ha respondido)
 *   if (user) return true;
 *   this.router.navigate(['/login']); // ❌ Redirige incorrectamente
 *   return false;
 * }
 * ```
 * 
 * **Alternativa sin authStateReady$ (peor UX):**
 * ```typescript
 * // ⚠️ FUNCIONA pero causa parpadeo en la UI
 * canActivate() {
 *   return this.auth.currentUser$.pipe(
 *     delay(500), // Esperar 500ms fijos (ineficiente)
 *     map(user => !!user)
 *   );
 * }
 * ```
 * 
 * @example
 * // En app-routing.module.ts
 * {
 *   path: 'tabs',
 *   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsModule),
 *   canActivate: [AuthGuard] // ← Proteger ruta con este guard
 * }
 * 
 * @see AuthService.authStateReady$ - Observable que indica cuándo Firebase está listo
 * @see AuthService.currentUser$ - Observable del usuario actual
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Verifica si el usuario puede acceder a la ruta protegida.
   * 
   * **Flujo de ejecución:**
   * 1. Espera a que authStateReady$ emita `true` (Firebase respondió)
   * 2. Toma solo el primer `true` y descarta el resto
   * 3. Cambia al observable currentUser$ para verificar si hay usuario
   * 4. Si hay usuario → permite acceso (return true)
   * 5. Si NO hay usuario → redirige a /login y bloquea (return false)
   * 
   * **Timing:**
   * - Firebase Local: ~5-10ms
   * - Firebase Cloud: ~100-300ms
   * - El guard espera pacientemente hasta que Firebase responda
   * 
   * @returns Observable<boolean> que emite true si permite acceso, false si bloquea
   * 
   * @example
   * // Angular ejecuta automáticamente este método al navegar a rutas protegidas
   * // Usuario navega a /tabs/home
   * // ↓
   * // AuthGuard.canActivate() se ejecuta
   * // ↓
   * // Espera a Firebase (authStateReady$)
   * // ↓
   * // Verifica usuario (currentUser$)
   * // ↓
   * // true: navega a /tabs/home
   * // false: redirige a /login
   */
  canActivate(): Observable<boolean> {
    return this.auth.authStateReady$.pipe(
      // 1. Filtrar: Solo continuar cuando authStateReady$ emita true
      //    (Espera a que Firebase responda, sea User o null)
      filter(ready => ready),
      
      // 2. Take: Tomar solo el primer true y completar el observable
      //    (No necesitamos seguir escuchando después de la primera verificación)
      take(1),
      
      // 3. SwitchMap: Cambiar de authStateReady$ a currentUser$
      //    (Ahora verificamos si efectivamente hay un usuario logueado)
      switchMap(() => this.auth.currentUser$),
      
      // 4. Map: Transformar User|null en boolean para decidir acceso
      map(user => {
        if (user) {
          // Usuario logueado: permitir acceso a la ruta
          return true;
        } else {
          // Usuario no logueado: redirigir al login y bloquear acceso
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
