import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, firstValueFrom, map, of, shareReplay, switchMap, tap, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth';
import { Role } from '../models/role';
import { Utilisateur } from '../models/utilisateur';
import { SessionService } from './session.service';
import { httpErrorMessage } from './http-error';

@Injectable({ providedIn: 'root' })
export class AuthService {
  get user$() { return this.session.user$; }
  sessionError = '';
  private validation?: Observable<Utilisateur>;
  private validationToken: string | null = null;

  constructor(private readonly http: HttpClient, private readonly session: SessionService, private readonly router: Router) {}

  login(request: LoginRequest): Observable<Utilisateur> { return this.authenticate('login', request); }
  register(request: RegisterRequest): Observable<Utilisateur> { return this.authenticate('register', request); }
  getToken(): string | null { return this.session.getToken(); }
  getCurrentUserFromSession(): Utilisateur | null { return this.session.user; }
  isAuthenticated(): boolean { return !!this.getToken() && !!this.session.user?.actif; }
  hasRole(role: Role): boolean { return this.isAuthenticated() && this.session.user?.role === role; }

  logout(): void {
    this.session.clear();
    this.sessionError = '';
    void this.router.navigate(['/auth/login']);
  }

  me(): Observable<Utilisateur> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('No session'));
    if (this.validation && this.validationToken === token) return this.validation;
    this.validationToken = token;
    this.validation = this.http.get<Utilisateur>(`${environment.apiUrl}/auth/me`).pipe(
      timeout(10_000),
      tap(user => { this.session.setUser(user, token); this.sessionError = ''; }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) this.session.endSession(token);
        if (this.getToken() === token) this.sessionError = httpErrorMessage(error);
        return throwError(() => error);
      }),
      finalize(() => { if (this.validationToken === token) this.validation = undefined; }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.validation;
  }

  ensureSession(): Observable<boolean> {
    if (this.isAuthenticated()) return of(true);
    if (!this.getToken()) return of(false);
    return this.me().pipe(map(() => true), catchError(() => of(false)));
  }

  async restoreSession(): Promise<void> {
    await firstValueFrom(this.ensureSession());
  }

  private authenticate(action: 'login' | 'register', request: LoginRequest | RegisterRequest): Observable<Utilisateur> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/${action}`, request).pipe(
      timeout(10_000),
      switchMap(response => {
        this.session.setToken(response.token);
        this.sessionError = '';
        // La réponse d'authentification vient du serveur ; /me confirme aussi le Bearer.
        return this.me();
      })
    );
  }
}
