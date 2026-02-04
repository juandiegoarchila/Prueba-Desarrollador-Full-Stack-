import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthRepository } from '../auth.repository';
import { User } from '../../../models/user.model';
import { StorageService } from '../../storage/storage.service';

/**
 * Implementación local del repositorio de autenticación.
 * 
 * Simula un sistema de autenticación completo usando Ionic Storage como "base de datos".
 * Útil para desarrollo, testing y modo demo sin necesidad de Firebase.
 * 
 * **Almacenamiento:**
 * - `local_users_db`: Array de usuarios registrados (incluye password en texto plano - ⚠️ solo para demo)
 * - `current_user`: Usuario actualmente logueado (sin password)
 * 
 * **Limitaciones (solo modo demo):**
 * - Passwords en texto plano (NO usar en producción real)
 * - Sin validación de email
 * - Sin rate limiting
 * - Sin recuperación real de contraseña
 * 
 * **Ventajas:**
 * - Funciona 100% offline
 * - No requiere configuración de Firebase
 * - Ideal para prototipado rápido
 * - Implementa la misma interfaz que FirebaseAuthRepository (intercambiable)
 * 
 * @example
 * // Configurar en environment.ts
 * export const environment = {
 *   production: false,
 *   useFirebase: false // ← Usar LocalAuthRepository
 * };
 * 
 * // AuthService automáticamente usa esta implementación
 * this.authService.login('demo@example.com', 'password').subscribe(user => {
 *   console.log('Login con repositorio local:', user);
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class LocalAuthRepository implements AuthRepository {
  /** Clave para almacenar el usuario actualmente logueado */
  private readonly USER_KEY = 'current_user';
  
  /** Clave para almacenar la "base de datos" de usuarios registrados */
  private readonly USERS_DB_KEY = 'local_users_db';

  constructor(private storage: StorageService) {}

  /**
   * Inicia sesión verificando email y contraseña en la "base de datos" local.
   * 
   * **Flujo de autenticación:**
   * 1. Lee la lista de usuarios desde Storage (USERS_DB_KEY)
   * 2. Busca un usuario que coincida email Y password
   * 3. Si existe: guarda sesión (USER_KEY) y devuelve usuario
   * 4. Si NO existe: rechaza con error
   * 
   * **Nota de seguridad:**
   * En este repositorio local, las contraseñas se guardan en texto plano.
   * ⚠️ NUNCA hacer esto en producción. Usar Firebase Auth o bcrypt.
   * 
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña en texto plano
   * @returns Observable con el usuario autenticado (sin password)
   * @throws Error si las credenciales son incorrectas
   * 
   * @example
   * this.localAuthRepo.login('demo@example.com', 'password123').subscribe({
   *   next: (user) => console.log('Login exitoso:', user.displayName),
   *   error: (err) => console.error('Credenciales inválidas:', err)
   * });
   */
  login(email: string, password: string): Observable<User> {
    return new Observable(observer => {
        this.storage.get(this.USERS_DB_KEY).then(users => {
            // Type guard: convertir unknown a array
            const usersList = Array.isArray(users) ? users : [];
            
            // Buscar usuario con email y password coincidentes
            const user = usersList.find((u: any) => u.email === email && u.password === password);
            
            if (user) {
                // Usuario encontrado: crear sesión y devolver datos seguros
                const safeUser: User = { 
                  uid: user.uid, 
                  email: user.email, 
                  displayName: user.displayName 
                };
                this.storage.set(this.USER_KEY, safeUser);
                observer.next(safeUser);
                observer.complete();
            } else {
                // Credenciales incorrectas
                observer.error('Credenciales inválidas (Local)');
            }
        });
    });
  }

  /**
   * Registra un nuevo usuario en la "base de datos" local.
   * 
   * **Flujo de registro:**
   * 1. Lee la lista de usuarios existentes desde Storage
   * 2. Verifica que el email NO esté ya registrado
   * 3. Crea un nuevo usuario con UID único (timestamp)
   * 4. Agrega el usuario al array de usuarios
   * 5. Guarda el array actualizado en Storage
   * 6. Crea sesión automáticamente (auto-login)
   * 7. Devuelve el usuario creado
   * 
   * **Nota de seguridad:**
   * La contraseña se guarda en texto plano en USERS_DB_KEY.
   * ⚠️ Solo para modo demo/desarrollo, NO usar en producción.
   * 
   * @param name - Nombre completo del usuario
   * @param email - Correo electrónico (debe ser único)
   * @param password - Contraseña (sin encriptar en este repo local)
   * @returns Observable con el usuario creado (sin password)
   * @throws Error si el email ya está registrado
   * 
   * @example
   * this.localAuthRepo.register('Juan Pérez', 'juan@example.com', 'password123').subscribe({
   *   next: (user) => console.log('Usuario creado:', user.uid),
   *   error: (err) => console.error('Email ya existe:', err)
   * });
   */
  register(name: string, email: string, password: string): Observable<User> {
      return new Observable(observer => {
          this.storage.get(this.USERS_DB_KEY).then(users => {
              // Type guard: asegurar que sea un array
              const currentUsers: any[] = Array.isArray(users) ? users : [];
              
              // Verificar que el email no esté ya registrado
              const exists = currentUsers.find((u: any) => u.email === email);
              if (exists) {
                  observer.error('El usuario ya existe');
                  return;
              }
              
              // Crear nuevo usuario con UID único
              const newUser = { 
                  uid: 'local_' + new Date().getTime(), // UID basado en timestamp
                  email, 
                  password, // ⚠️ Texto plano (solo para demo)
                  displayName: name 
              };
              
              // Agregar a la "base de datos"
              currentUsers.push(newUser);
              this.storage.set(this.USERS_DB_KEY, currentUsers);
              
              // Auto-login: guardar sesión actual
              const safeUser: User = { 
                uid: newUser.uid, 
                email: newUser.email, 
                displayName: newUser.displayName 
              };
              this.storage.set(this.USER_KEY, safeUser);
              
              // Devolver usuario creado
              observer.next(safeUser);
              observer.complete();
          });
      });
  }

  /**
   * Cierra la sesión del usuario actual.
   * 
   * **Comportamiento:**
   * - Elimina la clave USER_KEY de Storage (olvida quién está logueado)
   * - NO elimina al usuario de USERS_DB_KEY (puede volver a loguearse)
   * 
   * @returns Promise que se resuelve cuando la sesión se cierra
   * 
   * @example
   * await this.localAuthRepo.logout();
   * console.log('Sesión cerrada');
   */
  logout(): Promise<void> {
    return this.storage.remove(this.USER_KEY).then(() => {});
  }

  /**
   * Obtiene el usuario actualmente logueado desde Storage.
   * 
   * **Uso:**
   * - Se ejecuta automáticamente al iniciar la app (en AuthService.checkSession)
   * - Verifica si hay una sesión activa
   * - Si hay sesión → devuelve el usuario
   * - Si NO hay sesión → devuelve null
   * 
   * **Type guard:**
   * Verifica que el objeto almacenado tenga las propiedades requeridas (uid, email)
   * antes de asumirlo como User.
   * 
   * @returns Observable con el usuario actual o null si no hay sesión
   * 
   * @example
   * this.localAuthRepo.getCurrentUser().subscribe(user => {
   *   if (user) {
   *     console.log('Sesión activa:', user.email);
   *   } else {
   *     console.log('No hay sesión');
   *   }
   * });
   */
  getCurrentUser(): Observable<User | null> {
      return new Observable(observer => {
          this.storage.get(this.USER_KEY).then(user => {
              // Type guard: verificar que user tiene la estructura de User
              const isUser = user && typeof user === 'object' && 'uid' in user && 'email' in user;
              observer.next(isUser ? user as User : null);
              observer.complete();
          });
      });
  }

  /**
   * Simula el envío de un email para restablecer contraseña.
   * 
   * **Comportamiento:**
   * - Verifica que el email exista en USERS_DB_KEY
   * - Si existe → resuelve la promesa (simula email enviado)
   * - Si NO existe → rechaza con error
   * 
   * **Limitación:**
   * NO envía email real. Solo valida que el correo esté registrado.
   * En modo local no hay forma de restablecer la contraseña realmente.
   * 
   * @param email - Correo del usuario que olvidó su contraseña
   * @returns Promise que se resuelve si el email existe
   * @throws Error si el email no está registrado
   * 
   * @example
   * try {
   *   await this.localAuthRepo.resetPassword('user@example.com');
   *   console.log('Email de recuperación enviado (simulado)');
   * } catch (err) {
   *   console.error('Email no encontrado:', err);
   * }
   */
  resetPassword(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Verificar si el correo existe en la "base de datos" local
        this.storage.get(this.USERS_DB_KEY).then(users => {
            const usersList = Array.isArray(users) ? users : [];
            const user = usersList.find((u: any) => u.email === email);
            
            if (user) {
                // Usuario encontrado: simular envío de email
                console.log(`[LocalAuth] Email de restablecimiento enviado a ${email}`);
                resolve();
            } else {
                // Usuario no encontrado
                reject(new Error('No se encontró una cuenta con este correo electrónico.'));
            }
        });
    });
  }
}
