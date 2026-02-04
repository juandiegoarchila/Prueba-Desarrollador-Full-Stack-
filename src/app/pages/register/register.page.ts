import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppValidators } from '../../shared/utils/validators.util';

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
export class RegisterPage {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private nav: NavController,
    private notify: NotificationService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: AppValidators.passwordMatch('password', 'confirmPassword')
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { name, email, password } = this.registerForm.value;
      this.auth.register(name, email, password).subscribe({
        next: async () => {
          await this.auth.logout(); // Cerramos la sesión automática para forzar el login manual
          this.isLoading = false;
          this.notify.showSuccess('¡Registro exitoso! Por favor, inicia sesión para continuar.');
          this.nav.navigateRoot('/login');
        },
        error: (err) => {
          this.isLoading = false;
          this.notify.showError('Error al registrar: ' + err);
        }
      });
    }
  }

  goToLogin() {
    this.nav.navigateBack('/login');
  }
}
