import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthRepository } from '../auth.repository';
import { User } from '../../../models/user.model';
import { StorageService } from '../../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class LocalAuthRepository implements AuthRepository {
  private readonly USER_KEY = 'current_user';
  private readonly USERS_DB_KEY = 'local_users_db'; // Mock users list

  constructor(private storage: StorageService) {}

  login(email: string, password: string): Observable<User> {
    // Mock login logic
    return new Observable(observer => {
        this.storage.get(this.USERS_DB_KEY).then(users => {
            const user = (users || []).find((u: any) => u.email === email && u.password === password);
            if (user) {
                const safeUser: User = { uid: user.uid, email: user.email, displayName: user.displayName };
                this.storage.set(this.USER_KEY, safeUser);
                observer.next(safeUser);
                observer.complete();
            } else {
                observer.error('Credenciales inválidas (Local)');
            }
        });
    });
  }

  register(name: string, email: string, password: string): Observable<User> {
      return new Observable(observer => {
          this.storage.get(this.USERS_DB_KEY).then(users => {
              const currentUsers = users || [];
              const exists = currentUsers.find((u: any) => u.email === email);
              if (exists) {
                  observer.error('El usuario ya existe');
                  return;
              }
              const newUser = { 
                  uid: 'local_' + new Date().getTime(), 
                  email, 
                  password, 
                  displayName: name 
              };
              currentUsers.push(newUser);
              this.storage.set(this.USERS_DB_KEY, currentUsers);
              
              const safeUser: User = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName };
              this.storage.set(this.USER_KEY, safeUser);
              
              observer.next(safeUser);
              observer.complete();
          });
      });
  }

  logout(): Promise<void> {
    return this.storage.remove(this.USER_KEY).then(() => {});
  }

  getCurrentUser(): Observable<User | null> {
      return new Observable(observer => {
          this.storage.get(this.USER_KEY).then(user => {
              observer.next(user || null);
              observer.complete();
          });
      });
  }

  resetPassword(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Simulación: Verificar si el correo existe en la "base de datos" local
        this.storage.get(this.USERS_DB_KEY).then(users => {
            const user = (users || []).find((u: any) => u.email === email);
            if (user) {
                // Simular éxito
                console.log(`[LocalAuth] Email de restablecimiento enviado a ${email}`);
                resolve();
            } else {
                reject(new Error('No se encontró una cuenta con este correo electrónico.'));
            }
        });
    });
  }
}
