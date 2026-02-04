import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * **Página de Recuperación de Contraseña (ForgotPasswordPage)**
 * 
 * Permite al usuario solicitar un enlace de restablecimiento de contraseña vía email.
 * 
 * **Responsabilidades:**
 * - Capturar email del usuario con validación (required + email)
 * - Llamar a AuthService.resetPassword(email) que:
 *   * Con Firebase: envía email con link de reset
 *   * Con LocalStorage: simula envío exitoso (mock)
 * - Mostrar estado de éxito con banner informativo sobre SPAM
 * - Manejar errores específicos de Firebase (auth/user-not-found)
 * - Permitir volver al login
 * 
 * **Flujo de usuario:**
 * 1. Usuario llega desde LoginPage (enlace "¿Olvidaste tu contraseña?")
 * 2. Ingresa su email y hace clic en "ENVIAR ENLACE"
 * 3. Si éxito:
 *    - Se muestra estado de éxito con ícono de email
 *    - Banner informativo advierte revisar carpeta SPAM
 *    - Botón "VOLVER AL INICIO" para regresar a login
 * 4. Si error:
 *    - Toast con mensaje específico (ej: "No existe una cuenta con este correo")
 *    - Formulario permanece visible para reintentar
 * 
 * **Estados del componente:**
 * - `isLoading`: true mientras se envía el email (muestra spinner en botón)
 * - `isSuccess`: true después de envío exitoso (cambia UI a estado de éxito)
 * 
 * **Validaciones del formulario:**
 * - email: required + email format
 * - Botón deshabilitado si formulario inválido o isLoading
 * - Mensajes de error en tiempo real cuando el campo es dirty e inválido
 * 
 * **Manejo de errores de Firebase:**
 * - `auth/user-not-found`: "No existe una cuenta con este correo"
 * - Otros errores: mensaje genérico o error.message si está disponible
 * 
 * **Diseño visual:**
 * - Logo circular con ícono (lock-open-outline → mail-unread-outline en éxito)
 * - Banner informativo con fondo secondary (rgba + border)
 * - Animación fadeIn en estado de éxito
 * - Botón redondeado con spinner durante carga
 * - Link a login en footer
 * 
 * **Memory leak prevention:**
 * Implementa OnDestroy + takeUntil aunque actualmente NO hay subscripciones
 * explícitas. Se mantiene por consistencia con el resto de páginas y para
 * prevención proactiva si se agregan subscripciones en el futuro.
 * (El método onSubmit usa async/await, no subscripciones RxJS)
 * 
 * **Nota sobre SPAM:**
 * El banner advierte explícitamente revisar carpeta de SPAM porque muchos
 * proveedores de email (Gmail, Outlook) suelen filtrar emails automatizados
 * de Firebase Authentication.
 * 
 * @author Sistema Merpes
 * @version 1.0.0
 */
@Component({
  selector: 'app-forgot-password',
  template: `
    <ion-content class="auth-content">
      <div class="auth-container">
        
        <div class="auth-card fade-in-up">
          
          <div class="header-section">
            <div class="logo-circle">
              <ion-icon name="lock-open-outline" *ngIf="!isSuccess"></ion-icon>
              <ion-icon name="mail-unread-outline" color="success" *ngIf="isSuccess"></ion-icon>
            </div>
            <h2>{{ isSuccess ? '¡Correo Enviado!' : 'Recuperar Contraseña' }}</h2>
            <p>{{ isSuccess ? 'Revisa tu bandeja de entrada' : 'Ingresa tu correo para restablecer' }}</p>
          </div>

          <!-- Estado de Éxito con aviso de SPAM -->
          <div *ngIf="isSuccess" class="success-state">
            <div class="info-banner">
              <ion-icon name="information-circle-outline"></ion-icon>
              <p>Si no encuentras el correo en tu bandeja principal, por favor revisa la carpeta de <strong>Correo no deseado o SPAM</strong>.</p>
            </div>
            
            <ion-button expand="block" (click)="goToLogin()" class="main-btn">
              VOLVER AL INICIO
            </ion-button>
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!isSuccess">
            
            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon name="mail-outline" slot="start" color="medium"></ion-icon>
                <ion-input formControlName="email" type="email" placeholder="Correo electrónico"></ion-input>
              </ion-item>
              <div class="error-msg" *ngIf="resetForm.get('email')?.dirty && resetForm.get('email')?.invalid">
                <span *ngIf="resetForm.get('email')?.errors?.['required']">El correo es requerido.</span>
                <span *ngIf="resetForm.get('email')?.errors?.['email']">Correo inválido.</span>
              </div>
            </div>

            <ion-button expand="block" type="submit" [disabled]="!resetForm.valid || isLoading" class="main-btn">
              <ion-spinner name="crescent" *ngIf="isLoading"></ion-spinner>
              <span *ngIf="!isLoading">ENVIAR ENLACE</span>
            </ion-button>

          </form>

          <div class="footer-link" *ngIf="!isSuccess">
            <p>¿Recordaste tu contraseña? <a routerLink="/login">Inicia Sesión</a></p>
          </div>

        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .success-state {
      animation: fadeIn 0.5s ease-out;
    }
    .info-banner {
      background-color: rgba(var(--ion-color-secondary-rgb), 0.1);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 25px;
      text-align: left;
      border: 1px solid rgba(var(--ion-color-secondary-rgb), 0.2);
    }
    .info-banner ion-icon {
      font-size: 28px;
      color: var(--ion-color-secondary);
      flex-shrink: 0;
    }
    .info-banner p {
      margin: 0;
      font-size: 0.9rem;
      color: #444;
      line-height: 1.5;
    }
    .info-banner strong {
      color: var(--ion-color-secondary);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ForgotPasswordPage implements OnDestroy {
  /**
   * FormGroup del formulario de recuperación con validación de email.
   * Solo tiene un campo: email (required + email format).
   */
  resetForm: FormGroup;

  /**
   * Indica si está enviando el email de recuperación.
   * Controla el spinner en el botón y deshabilita el submit.
   */
  isLoading = false;

  /**
   * Indica si el email se envió exitosamente.
   * Cambia la UI a estado de éxito con banner informativo.
   */
  isSuccess = false;

  /**
   * Subject para implementar el patrón de limpieza de subscripciones.
   * Actualmente no hay subscripciones explícitas (onSubmit usa async/await),
   * pero se mantiene por consistencia y prevención proactiva.
   */
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController,
    private notify: NotificationService
  ) {
    // Inicializar formulario con validación de email
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Envía el email de recuperación de contraseña.
   * 
   * **Flujo de envío:**
   * 1. Validar que el formulario sea válido
   * 2. Activar isLoading (mostrar spinner)
   * 3. Extraer email del formulario
   * 4. Llamar a AuthService.resetPassword(email) que:
   *    - Con Firebase: envía email con link de reset
   *    - Con LocalStorage: simula envío exitoso (mock)
   * 5. Si éxito:
   *    - Activar isSuccess (cambiar UI)
   *    - Mostrar toast "Correo de recuperación enviado"
   * 6. Si error:
   *    - Manejar errores específicos de Firebase:
   *      * auth/user-not-found: "No existe una cuenta con este correo"
   *      * Otros: mensaje genérico o error.message
   *    - Mostrar toast de error
   * 7. Desactivar isLoading (ocultar spinner)
   * 
   * **¿Por qué async/await en lugar de subscribe?**
   * AuthService.resetPassword() devuelve Promise (no Observable),
   * por lo tanto usamos try-catch en lugar de subscribe.
   * 
   * **Manejo de errores de Firebase:**
   * - `auth/user-not-found`: El email no está registrado
   * - Otros códigos: se muestra error.message si está disponible
   * 
   * **Advertencia sobre SPAM:**
   * El banner en isSuccess advierte revisar carpeta SPAM porque
   * los emails de Firebase Authentication suelen ser filtrados.
   */
  async onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      const email = this.resetForm.value.email;

      try {
        await this.authService.resetPassword(email);
        this.isSuccess = true; // Cambiar UI a estado de éxito
        this.notify.showSuccess('Correo de recuperación enviado.');
      } catch (error: any) {
        let msg = 'Error al enviar el correo.';
         if (error.code === 'auth/user-not-found') {
          msg = 'No existe una cuenta con este correo.';
        } else if (error.message) {
            msg = error.message;
        }
        this.notify.showError(msg);
      } finally {
        this.isLoading = false; // Ocultar spinner
      }
    }
  }

  /**
   * Navega de vuelta a la página de login.
   * Usa navigateBack para mantener el historial de navegación.
   */
  goToLogin() {
    this.navCtrl.navigateBack('/login');
  }

  /**
   * Hook de destrucción que limpia las subscripciones.
   * Actualmente no hay subscripciones explícitas, pero se mantiene
   * por consistencia y prevención proactiva.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
