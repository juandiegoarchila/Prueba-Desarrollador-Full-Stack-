import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppValidators } from '../../shared/utils/validators.util';

@Component({
  selector: 'app-register',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Registro</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Nombre Completo</ion-label>
          <ion-input formControlName="name" type="text"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input formControlName="email" type="email"></ion-input>
        </ion-item>
        
        <ion-item>
          <ion-label position="floating">Contraseña</ion-label>
          <ion-input formControlName="password" type="password"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Confirmar Contraseña</ion-label>
          <ion-input formControlName="confirmPassword" type="password"></ion-input>
        </ion-item>

        <ion-text color="danger" *ngIf="registerForm.hasError('passwordMismatch')">
            <p class="ion-padding-start">Las contraseñas no coinciden</p>
        </ion-text>

        <ion-button expand="block" type="submit" [disabled]="!registerForm.valid" class="ion-margin-top">
          Registrarse
        </ion-button>
      </form>
    </ion-content>
  `
})
export class RegisterPage {
  registerForm: FormGroup;

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
      const { name, email, password } = this.registerForm.value;
      this.auth.register(name, email, password).subscribe({
        next: () => {
          this.notify.showSuccess('Cuenta creada exitosamente');
          this.nav.navigateRoot('/catalog');
        },
        error: (err) => {
          this.notify.showError('Error al registrar: ' + err);
        }
      });
    }
  }
}
