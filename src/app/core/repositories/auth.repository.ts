import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

export interface AuthRepository {
    login(email: string, password: string): Observable<User>;
    register(name: string, email: string, password: string): Observable<User>;
    logout(): Promise<void>;
    getCurrentUser(): Observable<User | null>;
}
