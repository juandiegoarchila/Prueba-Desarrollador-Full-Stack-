import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthRepository } from '../auth.repository';
import { User as AppUser } from '../../../models/user.model';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, UserCredential } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthRepository implements AuthRepository {
  private auth;

  constructor() {
      const app = initializeApp(environment.firebase);
      this.auth = getAuth(app);
  }

  login(email: string, password: string): Observable<AppUser> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
        map((credential: UserCredential) => {
            const user = credential.user;
            return {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Usuario'
            };
        })
    );
  }

  register(name: string, email: string, password: string): Observable<AppUser> {
      return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
          map((credential: UserCredential) => {
              const user = credential.user;
              // Ideally update profile with name here, but keeping simple
              return {
                uid: user.uid,
                email: user.email || '',
                displayName: name
            };
          })
      );
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  getCurrentUser(): Observable<AppUser | null> {
      return new Observable(observer => {
          onAuthStateChanged(this.auth, (user) => {
              if (user) {
                  observer.next({
                      uid: user.uid,
                      email: user.email || '',
                      displayName: user.displayName || 'Usuario'
                  });
              } else {
                  observer.next(null);
              }
          });
      });
  }
}
