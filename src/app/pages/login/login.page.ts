import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

/**
 * Página de inicio de sesión.
 * 
 * Implementa el formulario reactivo de login con validaciones y gestión de estado.
 * 
 * **Características:**
 * - Formulario reactivo con validaciones en tiempo real
 * - Loading spinner mientras autentica
 * - Navegación automática a /catalog después del login exitoso
 * - Mensajes de error amigables con NotificationService
 * - Patrón takeUntil para limpiar subscripciones y evitar memory leaks
 * 
 * **Flujo de autenticación:**
 * ```
 * Usuario completa formulario
 *     ↓
 * Validación (email + password mínimo 6 caracteres)
 *     ↓
 * Mostrar loading ("Validando...")
 *     ↓
 * AuthService.login() → Observable
 *     ↓
 * ├─ Éxito: Ocultar loading → Toast "Bienvenido" → Navegar a /catalog
 * └─ Error: Ocultar loading → Toast "Credenciales incorrectas"
 * ```
 * 
 * **Memory leak prevention:**
 * - Implementa OnDestroy
 * - Usa Subject destroy$ para cancelar subscripciones automáticamente
 * - takeUntil(this.destroy$) en todas las subscripciones
 * 
 * @example
 * // Navegación a esta página
 * this.navController.navigateForward('/login');
 * 
 * // Usuario demo (si usas LocalAuthRepository)
 * Email: demo@example.com
 * Password: password123
 */
@Component({
  selector: 'app-login',
  template: `
    <ion-content class="auth-content">
      <div class="auth-container">
        
        <!-- Tarjeta Flotante -->
        <div class="auth-card fade-in-up">
          
          <!-- Encabezado -->
          <div class="header-section">
            <div class="logo-circle">
              <ion-icon name="cube-outline"></ion-icon>
            </div>
            <h1>Bienvenido</h1>
            <p>Ingresa tus credenciales para acceder</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            
            <!-- Input Email -->
            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon name="mail-outline" slot="start" color="medium"></ion-icon>
                <ion-input formControlName="email" type="email" placeholder="Correo electrónico"></ion-input>
              </ion-item>
              <div class="error-msg" *ngIf="loginForm.get('email')?.dirty && loginForm.get('email')?.invalid">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">El correo es requerido.</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Correo inválido.</span>
              </div>
            </div>

            <!-- Input Password -->
            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon name="lock-closed-outline" slot="start" color="medium"></ion-icon>
                <ion-input formControlName="password" type="password" placeholder="Contraseña"></ion-input>
              </ion-item>
              <div class="error-msg" *ngIf="loginForm.get('password')?.dirty && loginForm.get('password')?.invalid">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">La contraseña es requerida.</span>
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres.</span>
              </div>
            </div>

            <div class="forgot-password ion-text-right">
              <a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            <!-- Botón de Acción -->
            <ion-button expand="block" type="submit" [disabled]="!loginForm.valid" class="main-btn">
              INICIAR SESIÓN
            </ion-button>

          </form>

          <!-- Footer -->
          <div class="footer-link">
            <p>¿No tienes cuenta? <a routerLink="/register">Regístrate ahora</a></p>
          </div>

        </div>
      </div>
    </ion-content>
  `
})
export class LoginPage implements OnDestroy {
  /** Formulario reactivo de login con validaciones */
  loginForm: FormGroup;

  /**
   * Subject para gestionar el ciclo de vida de las subscripciones.
   * 
   * **Patrón takeUntil:**
   * - destroy$ emite cuando el componente se destruye (ngOnDestroy)
   * - takeUntil(destroy$) cancela automáticamente todas las subscripciones
   * - Previene memory leaks causados por subscripciones activas después de destruir el componente
   * 
   * @example
   * // Uso en subscripciones
   * this.auth.login(email, password)
   *   .pipe(takeUntil(this.destroy$)) // ← Se cancela automáticamente en ngOnDestroy
   *   .subscribe(...)
   */
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private nav: NavController,
    private notify: NotificationService,
    private loadingCtrl: LoadingController
  ) {
    // Inicializar formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Maneja el envío del formulario de login.
   * 
   * **Flujo de ejecución:**
   * 1. Verifica validez del formulario (email válido + password >= 6 caracteres)
   * 2. Muestra loading spinner con mensaje "Validando..."
   * 3. Llama a AuthService.login() con credenciales
   * 4. Si éxito:
   *    - Oculta loading
   *    - Muestra toast de bienvenida
   *    - Navega a /catalog (navegación root para resetear stack)
   * 5. Si error:
   *    - Oculta loading
   *    - Muestra toast de error
   * 
   * **Nota sobre takeUntil:**
   * La subscripción se cancela automáticamente cuando el componente se destruye,
   * evitando memory leaks si el usuario navega antes de que complete el login.
   * 
   * @example
   * // El formulario llama a este método al hacer submit
   * <form (ngSubmit)="onSubmit()">
   */
  async onSubmit() {
    if (this.loginForm.valid) {
      // Crear y mostrar loading spinner
      const loading = await this.loadingCtrl.create({ message: 'Validando...' });
      await loading.present();

      // Extraer valores del formulario
      const { email, password } = this.loginForm.value;
      
      // Intentar autenticación
      this.auth.login(email, password)
        .pipe(takeUntil(this.destroy$)) // Cancelar si el componente se destruye
        .subscribe({
          next: () => {
            // Login exitoso
            loading.dismiss();
            this.notify.showSuccess('Bienvenido de nuevo');
            // navigateRoot resetea el stack de navegación (no puede volver atrás con botón back)
            this.nav.navigateRoot('/catalog');
          },
          error: (err) => {
            // Login fallido (credenciales incorrectas o error de red)
            loading.dismiss();
            this.notify.showError('Credenciales incorrectas');
          }
        });
    } else {
      // Formulario inválido: marcar todos los campos como touched para mostrar errores
      this.loginForm.markAllAsTouched();
    }
  }

  /**
   * Hook de ciclo de vida que se ejecuta cuando el componente se destruye.
   * 
   * **Responsabilidad:**
   * - Emitir evento en destroy$ para cancelar todas las subscripciones activas
   * - Completar el Subject para liberar memoria
   * 
   * **Importancia:**
   * Sin este cleanup, las subscripciones seguirían activas después de destruir
   * el componente, causando memory leaks y comportamientos inesperados.
   * 
   * @example
   * // Angular llama automáticamente a este método cuando:
   * // - El usuario navega a otra página
   * // - El componente es removido del DOM
   * // - La aplicación se cierra
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Emitir evento para cancelar subscripciones
    this.destroy$.complete(); // Completar el Subject
  }
}

