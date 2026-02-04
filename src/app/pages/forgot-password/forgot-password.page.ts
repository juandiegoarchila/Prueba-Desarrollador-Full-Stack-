import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

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
export class ForgotPasswordPage {
  resetForm: FormGroup;
  isLoading = false;
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController,
    private notify: NotificationService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      const email = this.resetForm.value.email;

      try {
        await this.authService.resetPassword(email);
        this.isSuccess = true;
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
        this.isLoading = false;
      }
    }
  }

  goToLogin() {
    this.navCtrl.navigateBack('/login');
  }
}
