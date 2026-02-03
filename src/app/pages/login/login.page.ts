import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input formControlName="email" type="email"></ion-input>
        </ion-item>
        
        <ion-item>
          <ion-label position="floating">Contraseña</ion-label>
          <ion-input formControlName="password" type="password"></ion-input>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="!loginForm.valid" class="ion-margin-top">
          Ingresar
        </ion-button>
      </form>

      <div class="ion-text-center ion-margin-top">
        <create-account-link>
          <a routerLink="/register">¿No tienes cuenta? Regístrate aquí</a>
        </create-account-link>
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
    private notify: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.auth.login(email, password).subscribe({
        next: () => {
          this.notify.showSuccess('Bienvenido');
          this.nav.navigateRoot('/catalog');
        },
        error: (err) => {
          this.notify.showError('Error: ' + err);
        }
      });
    }
  }
}
