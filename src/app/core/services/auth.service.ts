import { Injectable, Inject, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { AuthRepository } from '../repositories/auth.repository';
import { LocalAuthRepository } from '../repositories/local/local-auth.repository';
import { FirebaseAuthRepository } from '../repositories/firebase/firebase-auth.repository';
import { environment } from 'src/environments/environment';

/**
 * Servicio de autenticación con patrón Repository.
 * 
 * **Arquitectura:**
 * - Abstrae la implementación de autenticación detrás de una interfaz (AuthRepository)
 * - Usa Injector para seleccionar dinámicamente entre LocalAuthRepository o FirebaseAuthRepository
 * - Mantiene el estado del usuario en un BehaviorSubject para reactividad
 * 
 * **Patrón Repository:**
 * ```
 * AuthService (capa de lógica de negocio)
 *     ↓ usa
 * AuthRepository (interfaz abstracta)
 *     ↓ implementada por
 * LocalAuthRepository (almacenamiento local) ← modo demo/desarrollo
 *     O
 * FirebaseAuthRepository (Firebase Auth) ← modo producción
 * ```
 * 
 * **authStateReady$:**
 * Observable especial que resuelve el problema de los guards que ejecutan
 * antes de que Firebase responda. Los guards usan:
 * ```typescript
 * this.authService.authStateReady$.pipe(
 *   filter(ready => ready === true),  // Esperar a que Firebase responda
 *   take(1),                           // Completar después de la primera emisión
 *   switchMap(() => this.authService.currentUser$)
 * )
 * ```
 * 
 * **Flujo de inicialización:**
 * 1. Constructor selecciona repository según environment.useFirebase
 * 2. checkSession() consulta si hay sesión activa
 * 3. Firebase responde (usuario o null)
 * 4. authStateReady$ emite true
 * 5. Los guards ahora pueden ejecutar con seguridad
 * 
 * @example
 * // Login
 * this.authService.login('user@example.com', 'password').subscribe({
 *   next: (user) => this.router.navigate(['/tabs/home']),
 *   error: (err) => console.error('Login failed:', err)
 * });
 * 
 * // Observar cambios de usuario
 * this.authService.currentUser$.subscribe(user => {
 *   if (user) {
 *     console.log('Usuario logueado:', user.name);
 *   } else {
 *     console.log('Usuario deslogueado');
 *   }
 * });
 * 
 * // Verificar autenticación (síncrono)
 * if (this.authService.isAuthenticated()) {
 *   console.log('Usuario autenticado');
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * BehaviorSubject privado que mantiene el estado del usuario autenticado.
   * Emite null cuando no hay usuario logueado, o el objeto User cuando sí hay.
   */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  /**
   * Observable público del usuario actual para subscripciones en componentes.
   * 
   * @example
   * this.authService.currentUser$.subscribe(user => {
   *   this.isLoggedIn = !!user;
   *   this.userName = user?.name;
   * });
   */
  public currentUser$ = this.currentUserSubject.asObservable();
  
  /**
   * BehaviorSubject que indica si Firebase Auth ya respondió al menos una vez.
   * 
   * **Problema que resuelve:**
   * Cuando la app arranca, Firebase tarda unos milisegundos en verificar si hay sesión.
   * Los guards pueden ejecutarse antes de que Firebase responda, causando
   * redireccionamientos incorrectos.
   * 
   * **Solución:**
   * - Empieza en false
   * - Cambia a true cuando Firebase responde (en checkSession)
   * - Los guards esperan a que sea true antes de decidir
   * 
   * @example
   * // En auth.guard.ts
   * return this.authService.authStateReady$.pipe(
   *   filter(ready => ready === true),     // Esperar a que Firebase esté listo
   *   take(1),                             // Solo necesitamos una verificación
   *   switchMap(() => this.authService.currentUser$),
   *   map(user => !!user)                  // Convertir a boolean
   * );
   */
  private authStateReadySubject = new BehaviorSubject<boolean>(false);
  public authStateReady$ = this.authStateReadySubject.asObservable();

  /**
   * Getter para acceso síncrono al usuario actual.
   * Útil cuando necesitas el usuario inmediatamente sin subscribirte.
   * 
   * @returns Usuario actual o null si no hay sesión
   * 
   * @example
   * const user = this.authService.currentUserValue;
   * if (user) {
   *   console.log('Usuario:', user.email);
   * }
   */
  public get currentUserValue(): User | null {
      return this.currentUserSubject.value;
  }

  /**
   * Instancia del repositorio de autenticación (Local o Firebase).
   * Se selecciona dinámicamente en el constructor según environment.useFirebase.
   */
  private repository: AuthRepository;

  /**
   * Constructor del servicio de autenticación.
   * 
   * **Patrón Injector:**
   * Se usa Injector manual en lugar de inyección directa en constructor
   * para seleccionar dinámicamente el repositorio según configuración.
   * 
   * **Flujo:**
   * 1. Leer environment.useFirebase
   * 2. Si true → inyectar FirebaseAuthRepository
   * 3. Si false → inyectar LocalAuthRepository
   * 4. Llamar checkSession() para verificar sesión existente
   * 
   * @param injector - Injector de Angular para resolución dinámica de dependencias
   */
  constructor(private injector: Injector) {
      // Selección dinámica del repository según configuración
      if (environment.useFirebase) {
          this.repository = this.injector.get(FirebaseAuthRepository);
      } else {
          this.repository = this.injector.get(LocalAuthRepository);
      }
      
      // Verificar si hay sesión activa al iniciar la app
      this.checkSession();
  }

  /**
   * Verifica si hay una sesión activa al iniciar la aplicación.
   * 
   * **Comportamiento:**
   * - LocalAuthRepository: Lee de Storage (instantáneo)
   * - FirebaseAuthRepository: Usa onAuthStateChanged (tarda ~100-300ms)
   * 
   * **Importante:**
   * Este método marca authStateReady$ como true cuando recibe respuesta,
   * lo que desbloquea los guards que estén esperando.
   */
  private checkSession() {
      this.repository.getCurrentUser().subscribe(user => {
          this.currentUserSubject.next(user);
          // Marcar que Firebase ya respondió (sea user o null)
          this.authStateReadySubject.next(true);
      });
  }

  /**
   * Inicia sesión con email y contraseña.
   * 
   * @param email - Correo electrónico del usuario
   * @param pass - Contraseña
   * @returns Observable con el usuario autenticado
   * 
   * @example
   * this.authService.login('user@example.com', 'password123').subscribe({
   *   next: (user) => {
   *     console.log('Login exitoso:', user.name);
   *     this.router.navigate(['/tabs/home']);
   *   },
   *   error: (err) => {
   *     console.error('Error en login:', err);
   *     alert('Credenciales incorrectas');
   *   }
   * });
   */
  login(email: string, pass: string): Observable<User> {
      const obs = this.repository.login(email, pass);
      // Actualizar el currentUserSubject cuando el login sea exitoso
      obs.subscribe(user => this.currentUserSubject.next(user));
      return obs;
  }

  /**
   * Registra un nuevo usuario.
   * 
   * @param name - Nombre completo del usuario
   * @param email - Correo electrónico
   * @param pass - Contraseña (mínimo 6 caracteres)
   * @returns Observable con el usuario creado
   * 
   * @example
   * this.authService.register('Juan Pérez', 'juan@example.com', 'password123').subscribe({
   *   next: (user) => {
   *     console.log('Usuario creado:', user.uid);
   *     this.router.navigate(['/tabs/home']);
   *   },
   *   error: (err) => {
   *     console.error('Error en registro:', err);
   *     alert('El email ya está en uso');
   *   }
   * });
   */
  register(name: string, email: string, pass: string): Observable<User> {
      const obs = this.repository.register(name, email, pass);
      // Actualizar el currentUserSubject cuando el registro sea exitoso
      obs.subscribe(user => this.currentUserSubject.next(user));
      return obs;
  }

  /**
   * Cierra la sesión del usuario actual.
   * 
   * **Comportamiento:**
   * - LocalAuthRepository: Borra de Storage
   * - FirebaseAuthRepository: Llama a firebase.auth().signOut()
   * 
   * @example
   * await this.authService.logout();
   * this.router.navigate(['/auth/login']);
   */
  async logout() {
      await this.repository.logout();
      // Limpiar el usuario del BehaviorSubject
      this.currentUserSubject.next(null);
  }

  /**
   * Envía un email para restablecer la contraseña.
   * 
   * **Solo funciona con Firebase.**
   * LocalAuthRepository lanza un error si se intenta usar.
   * 
   * @param email - Email del usuario que olvidó su contraseña
   * @returns Promise que se resuelve cuando el email es enviado
   * 
   * @example
   * try {
   *   await this.authService.resetPassword('user@example.com');
   *   alert('Email de recuperación enviado');
   * } catch (err) {
   *   console.error('Error:', err);
   *   alert('No se pudo enviar el email');
   * }
   */
  resetPassword(email: string): Promise<void> {
      return this.repository.resetPassword(email);
  }

  /**
   * Verifica de forma síncrona si hay un usuario autenticado.
   * 
   * **Alternativa reactiva:** Usar currentUser$ observable en el template
   * con async pipe para verificación automática.
   * 
   * @returns true si hay usuario logueado, false si no
   * 
   * @example
   * if (this.authService.isAuthenticated()) {
   *   console.log('Usuario autenticado');
   * } else {
   *   this.router.navigate(['/auth/login']);
   * }
   */
  isAuthenticated(): boolean {
      return this.currentUserSubject.value !== null;
  }
}
