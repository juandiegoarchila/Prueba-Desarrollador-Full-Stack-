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
              <ion-icon name="lock-open-outline"></ion-icon>
            </div>
            <h2>Recuperar Contraseña</h2>
            <p>Ingresa tu correo para restablecer</p>
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            
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

          <div class="footer-link">
            <p>¿Recordaste tu contraseña? <a routerLink="/login">Inicia Sesión</a></p>
          </div>

        </div>
      </div>
    </ion-content>
  `
})
export class ForgotPasswordPage {
  resetForm: FormGroup;
  isLoading = false;

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
        this.notify.showSuccess('Correo de recuperación enviado.');
        this.navCtrl.navigateBack('/login');
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
}
