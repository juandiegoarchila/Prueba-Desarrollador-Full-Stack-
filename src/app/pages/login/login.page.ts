import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

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
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private nav: NavController,
    private notify: NotificationService,
    private loadingCtrl: LoadingController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const loading = await this.loadingCtrl.create({ message: 'Validando...' });
      await loading.present();

      const { email, password } = this.loginForm.value;
      this.auth.login(email, password).subscribe({
        next: () => {
          loading.dismiss();
          this.notify.showSuccess('Bienvenido de nuevo');
          this.nav.navigateRoot('/catalog');
        },
        error: (err) => {
          loading.dismiss();
          this.notify.showError('Credenciales incorrectas');
        }
      });
    } else {
        this.loginForm.markAllAsTouched();
    }
  }
}

