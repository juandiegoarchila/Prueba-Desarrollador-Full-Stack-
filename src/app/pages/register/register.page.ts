import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppValidators } from '../../shared/utils/validators.util';

/**
 * Página de registro de nuevos usuarios.
 * 
 * Implementa formulario reactivo con validaciones personalizadas para crear cuentas.
 * 
 * **Características:**
 * - Formulario reactivo con validaciones en tiempo real
 * - Validador custom passwordMatch para verificar que las contraseñas coincidan
 * - Loading inline (spinner dentro del botón)
 * - Auto-logout después del registro para forzar login manual
 * - Patrón takeUntil para cleanup de subscripciones
 * 
 * **Flujo de registro:**
 * ```
 * Usuario completa formulario
 *     ↓
 * Validación (nombre + email + password + passwordMatch)
 *     ↓
 * AuthService.register() → Observable
 *     ↓
 * Usuario creado en repositorio (Local o Firebase)
 *     ↓
 * Auto-logout (cerrar sesión automática)
 *     ↓
 * Toast "Registro exitoso, inicia sesión"
 *     ↓
 * Navegar a /login
 * ```
 * 
 * **¿Por qué auto-logout después del registro?**
 * - El método register() crea la cuenta Y autologa al usuario
 * - Pero queremos que el usuario inicie sesión manualmente (mejor UX)
 * - Llamamos a logout() para cerrar la sesión automática
 * - El usuario debe hacer login explícitamente con sus credenciales
 * 
 * **Validador custom passwordMatch:**
 * Verifica que los campos 'password' y 'confirmPassword' tengan el mismo valor.
 * Implementado en AppValidators.passwordMatch() (ver shared/utils/validators.util.ts).
 * 
 * @example
 * // Navegación a esta página
 * this.navController.navigateForward('/register');
 */

@Component({
  selector: 'app-register',
  template: `
    <ion-content class="auth-content">
      <div class="auth-container">
        <!-- Tarjeta de Registro con sombra y borde redondeado -->
        <div class="auth-card fade-in-up">
          
          <!-- Encabezado con Icono Circular -->
          <div class="header-section">
            <div class="logo-circle">
              <ion-icon name="person-add-outline"></ion-icon>
            </div>
            <h2>Crear Cuenta</h2>
            <p>Únete para explorar nuestro catálogo</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            
            <!-- Input: Nombre Completo -->
            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon name="person-outline" slot="start" color="medium"></ion-icon>
                <ion-input formControlName="name" type="text" placeholder="Nombre completo"></ion-input>
              </ion-item>
              <!-- Mensajes de Error: Nombre -->
              <div class="error-msg" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid">
                <span *ngIf="registerForm.get('name')?.errors?.['required']">El nombre es requerido.</span>
              </div>
            </div>

            <!-- Input: Email -->
            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon name="mail-outline" slot="start" color="medium"></ion-icon>
                <ion-input formControlName="email" type="email" placeholder="Correo electrónico"></ion-input>
              </ion-item>
              <!-- Mensajes de Error: Email -->
              <div class="error-msg" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">El correo es requerido.</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Ingresa un correo válido.</span>
              </div>
            </div>
            
            <!-- Input: Contraseña -->
            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon name="lock-closed-outline" slot="start" color="medium"></ion-icon>
                <ion-input formControlName="password" type="password" placeholder="Contraseña"></ion-input>
              </ion-item>
              <!-- Mensajes de Error: Password -->
              <div class="error-msg" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">La contraseña es requerida.</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres.</span>
              </div>
            </div>

            <!-- Input: Confirmar Contraseña -->
            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon name="shield-checkmark-outline" slot="start" color="medium"></ion-icon>
                <ion-input formControlName="confirmPassword" type="password" placeholder="Confirmar contraseña"></ion-input>
              </ion-item>
              <!-- Mensajes de Error: Match -->
              <div class="error-msg" *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                <span>Las contraseñas no coinciden.</span>
              </div>
            </div>

            <!-- Botón de Acción -->
            <ion-button expand="block" type="submit" [disabled]="!registerForm.valid || isLoading" class="main-btn">
              <ion-spinner name="crescent" *ngIf="isLoading"></ion-spinner>
              <span *ngIf="!isLoading">Registrarme</span>
            </ion-button>
          </form>

          <!-- Footer: Volver al Login -->
          <div class="footer-link">
            <p>¿Ya tienes cuenta? <a (click)="goToLogin()">Inicia Sesión</a></p>
          </div>

        </div>
      </div>
    </ion-content>
  `
})
export class RegisterPage implements OnDestroy {
  /** Formulario reactivo de registro con validaciones */
  registerForm: FormGroup;
  
  /** Flag para mostrar spinner dentro del botón durante el registro */
  isLoading = false;

  /**
   * Subject para gestionar el ciclo de vida de las subscripciones.
   * Previene memory leaks cancelando subscripciones al destruir el componente.
   */
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private nav: NavController,
    private notify: NotificationService
  ) {
    /**
     * Inicializar formulario con validaciones.
     * 
     * **Validaciones a nivel de campo:**
     * - name: requerido
     * - email: requerido + formato email válido
     * - password: requerido + mínimo 6 caracteres
     * - confirmPassword: requerido
     * 
     * **Validación a nivel de formulario:**
     * - passwordMatch: validador custom que verifica que password === confirmPassword
     * 
     * **Cómo funciona passwordMatch:**
     * ```typescript
     * // En AppValidators.passwordMatch('password', 'confirmPassword')
     * static passwordMatch(pass: string, confirmPass: string): ValidatorFn {
     *   return (formGroup: AbstractControl): ValidationErrors | null => {
     *     const passwordControl = formGroup.get(pass);
     *     const confirmPasswordControl = formGroup.get(confirmPass);
     *     
     *     if (!passwordControl || !confirmPasswordControl) return null;
     *     
     *     // Comparar valores
     *     if (passwordControl.value !== confirmPasswordControl.value) {
     *       return { passwordMismatch: true }; // ← Error a nivel de FormGroup
     *     }
     *     
     *     return null; // Sin errores
     *   };
     * }
     * ```
     * 
     * **Uso en el template:**
     * ```html
     * <div *ngIf="registerForm.hasError('passwordMismatch') && ...">
     *   Las contraseñas no coinciden.
     * </div>
     * ```
     */
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      // Validador a nivel de FormGroup (compara password con confirmPassword)
      validators: AppValidators.passwordMatch('password', 'confirmPassword')
    });
  }

  /**
   * Maneja el envío del formulario de registro.
   * 
   * **Flujo de ejecución:**
   * 1. Verifica validez del formulario (todas las validaciones pasan)
   * 2. Activa flag isLoading (muestra spinner en botón)
   * 3. Extrae name, email, password del formulario
   * 4. Llama a AuthService.register() que:
   *    a. Crea el usuario en el repositorio (Local o Firebase)
   *    b. Auto-loguea al usuario (crea sesión automáticamente)
   * 5. Si éxito:
   *    - Llama a logout() para cerrar la sesión automática
   *    - Muestra toast "Registro exitoso, inicia sesión"
   *    - Navega a /login (el usuario debe iniciar sesión manualmente)
   * 6. Si error:
   *    - Muestra toast con el mensaje de error
   *    - Desactiva isLoading
   * 
   * **¿Por qué logout después del registro exitoso?**
   * - register() crea cuenta + auto-login (para evitar pedir credenciales dos veces)
   * - Pero en esta app queremos que el usuario vea la pantalla de login
   * - Mejor UX: confirmar que recuerda sus credenciales haciendo login manual
   * - Alternativa: Omitir logout() y navegar directo a /catalog (auto-login completo)
   * 
   * @example
   * // Registro exitoso (modo LocalAuth)
   * this.onSubmit() // → Usuario creado en local_users_db
   *                 // → Sesión automática creada en current_user
   *                 // → logout() elimina current_user
   *                 // → Usuario debe hacer login manualmente
   */
  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { name, email, password } = this.registerForm.value;
      
      this.auth.register(name, email, password)
        .pipe(takeUntil(this.destroy$)) // Cancelar si el componente se destruye
        .subscribe({
          next: async () => {
            // Usuario creado exitosamente y auto-logueado
            // Cerrar sesión automática para forzar login manual
            await this.auth.logout();
            
            this.isLoading = false;
            this.notify.showSuccess('¡Registro exitoso! Por favor, inicia sesión para continuar.');
            // navigateRoot resetea el stack de navegación
            this.nav.navigateRoot('/login');
          },
          error: (err) => {
            // Error en el registro (email ya existe, error de red, etc.)
            this.isLoading = false;
            this.notify.showError('Error al registrar: ' + err);
          }
        });
    }
  }

  /**
   * Navega de vuelta a la página de login.
   * 
   * **navigateBack vs navigateForward:**
   * - navigateBack: Simula botón "atrás", mantiene animación de retroceso
   * - navigateForward: Simula ir hacia adelante, animación de avance
   * 
   * @example
   * // Usuario hace clic en "¿Ya tienes cuenta? Inicia Sesión"
   * <a (click)="goToLogin()">Inicia Sesión</a>
   */
  goToLogin() {
    this.nav.navigateBack('/login');
  }

  /**
   * Hook de ciclo de vida que se ejecuta cuando el componente se destruye.
   * Limpia las subscripciones activas para evitar memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
