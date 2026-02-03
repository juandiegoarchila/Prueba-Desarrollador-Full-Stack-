import { Injectable, Inject, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  
  private repository: AuthRepository;

  constructor(private injector: Injector) {
      // Manual factory pattern for simplicity in this context
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

  isAuthenticated(): boolean {
      return this.currentUserSubject.value !== null;
  }
}
