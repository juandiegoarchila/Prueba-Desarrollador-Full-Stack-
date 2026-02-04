import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // Esperar a que el estado de autenticación esté listo (Firebase responda)
    return this.auth.authStateReady$.pipe(
      filter(ready => ready), // Filtrar solo cuando sea true
      take(1),                // Tomar el primer valor true y completar
      switchMap(() => this.auth.currentUser$), // Cambiar al stream del usuario actual
      map(user => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
