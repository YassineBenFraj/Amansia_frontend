import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Role } from '../models/role';
import { Utilisateur } from '../models/utilisateur';
import { safeReturnUrl } from './return-url';

export const TOKEN_KEY = 'amansia_token';
export const USER_KEY = 'amansia_user';

@Injectable({ providedIn: 'root' })
export class SessionService implements OnDestroy {
  private token: string | null = null;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly userSubject = new BehaviorSubject<Utilisateur | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly router: Router, private readonly zone: NgZone) {
    try { this.token = localStorage.getItem(TOKEN_KEY); } catch { /* Stockage indisponible. */ }
    // L'utilisateur en cache n'accorde aucun rôle avant la réponse de /auth/me.
    if (!this.getToken()) this.clear();
    window.addEventListener('storage', this.onStorage);
  }

  getToken(): string | null {
    if (this.token && this.expiresAt(this.token) <= Date.now()) this.clear();
    return this.token;
  }

  get user(): Utilisateur | null { return this.userSubject.value; }

  setToken(token: string): void {
    if (this.expiresAt(token) <= Date.now()) throw new Error('Invalid session');
    this.clear();
    try {
      localStorage.setItem(TOKEN_KEY, token);
      this.token = token;
      this.scheduleExpiry(token);
    } catch {
      this.clear();
      throw new Error('Session storage unavailable');
    }
  }

  setUser(user: Utilisateur, expectedToken: string): void {
    if (this.getToken() !== expectedToken) throw new Error('Session changed');
    if (!user || !user.actif || !Object.values(Role).includes(user.role)) {
      this.clear();
      throw new Error('Inactive user');
    }
    // Liste explicite : aucune donnée de formulaire ou mot de passe n'est conservé.
    const stored: Utilisateur = {
      id: user.id, nom: user.nom, prenom: user.prenom, email: user.email,
      telephone: user.telephone, dateNaissance: user.dateNaissance, role: user.role,
      actif: user.actif, dateCreation: user.dateCreation, dateModification: user.dateModification
    };
    try { localStorage.setItem(USER_KEY, JSON.stringify(stored)); } catch {
      this.clear();
      throw new Error('Session storage unavailable');
    }
    this.userSubject.next(stored);
    this.scheduleExpiry(expectedToken);
  }

  clear(): void {
    this.token = null;
    clearTimeout(this.timer);
    this.userSubject.next(null);
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch { /* État mémoire nettoyé. */ }
  }

  endSession(expectedToken?: string): void {
    // Une ancienne requête ne doit pas déconnecter une nouvelle session.
    if (expectedToken && this.token !== expectedToken) return;
    const returnUrl = safeReturnUrl(this.router.url);
    this.clear();
    if (!this.router.url.startsWith('/auth/')) {
      void this.router.navigate(['/auth/login'], { queryParams: { returnUrl, session: 'expired' } });
    }
  }

  private expiresAt(token: string): number {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return 0;
      const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload: { exp?: unknown } = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
      return typeof payload.exp === 'number' && Number.isFinite(payload.exp) ? payload.exp * 1000 : 0;
    } catch { return 0; }
  }

  private scheduleExpiry(token: string): void {
    clearTimeout(this.timer);
    const delay = Math.min(this.expiresAt(token) - Date.now(), 2_147_483_647);
    this.zone.runOutsideAngular(() => {
      this.timer = setTimeout(() => this.zone.run(() => {
        if (this.expiresAt(token) <= Date.now()) this.endSession(token);
        else this.scheduleExpiry(token);
      }), Math.max(delay, 0));
    });
  }

  private readonly onStorage = (event: StorageEvent): void => {
    if (event.key === TOKEN_KEY || event.key === null) {
      // Un autre onglet a changé de compte : invalider l'état vérifié de cet onglet.
      this.token = null;
      clearTimeout(this.timer);
      this.userSubject.next(null);
      void this.router.navigate(['/auth/login']);
    }
  };

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    window.removeEventListener('storage', this.onStorage);
  }
}
