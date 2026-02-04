import { Injectable, Inject, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { AuthRepository } from '../repositories/auth.repository';
import { LocalAuthRepository } from '../repositories/local/local-auth.repository';
import { FirebaseAuthRepository } from '../repositories/firebase/firebase-auth.repository';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Nuevo: Flag para saber si Firebase ya respondió al menos una vez
  private authStateReadySubject = new BehaviorSubject<boolean>(false);
  public authStateReady$ = this.authStateReadySubject.asObservable();

  private repository: AuthRepository;

  constructor(private injector: Injector) {
      if (environment.useFirebase) {
          this.repository = this.injector.get(FirebaseAuthRepository);
      } else {
          this.repository = this.injector.get(LocalAuthRepository);
      }
      
      this.checkSession();
  }

  private checkSession() {
      this.repository.getCurrentUser().subscribe(user => {
          this.currentUserSubject.next(user);
          this.authStateReadySubject.next(true); // Ya sabemos el estado (sea user o null)
      });
  }

  login(email: string, pass: string): Observable<User> {
      const obs = this.repository.login(email, pass);
      obs.subscribe(user => this.currentUserSubject.next(user));
      return obs;
  }


  register(name: string, email: string, pass: string): Observable<User> {
      const obs = this.repository.register(name, email, pass);
      obs.subscribe(user => this.currentUserSubject.next(user));
      return obs;
  }

  async logout() {
      await this.repository.logout();
      this.currentUserSubject.next(null);
  }

  resetPassword(email: string): Promise<void> {
      return this.repository.resetPassword(email);
  }

  isAuthenticated(): boolean {
      return this.currentUserSubject.value !== null;
  }
}
