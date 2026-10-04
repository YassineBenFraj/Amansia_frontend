import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Favori } from '../models/favori';
import { Produit } from '../models/catalogue';
import { Role } from '../models/role';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FavorisService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly api = `${environment.apiUrl}/favoris`;
  private readonly itemsSubject = new BehaviorSubject<Favori[]>([]);
  readonly items$ = this.itemsSubject.asObservable();
  readonly count$ = this.items$.pipe(map(items => items.length));
  private readonly pending = new Set<number>();
  private loading?: Observable<Favori[]>;
  private loaded = false;
  private ownerId: number | null = null;
  private version = 0;

  constructor() {
    this.auth.user$.subscribe(user => {
      const id = user?.role === Role.CLIENT ? user.id : null;
      if (id !== this.ownerId) {
        this.ownerId = id;
        this.loaded = false;
        this.loading = undefined;
        this.pending.clear();
        this.itemsSubject.next([]);
        this.version++;
      }
      if (id !== null) this.charger().subscribe({ error: () => {} });
    });
  }

  charger(force = false): Observable<Favori[]> {
    if (!this.auth.hasRole(Role.CLIENT)) return of([]);
    if (!force && this.loaded) return of(this.itemsSubject.value);
    if (this.loading) return this.loading;
    const owner = this.ownerId;
    const version = this.version;
    this.loading = this.http.get<Favori[]>(this.api).pipe(
      tap(items => {
        if (owner === this.ownerId && version === this.version) {
          this.itemsSubject.next(items);
          this.loaded = true;
        }
      }),
      finalize(() => { this.loading = undefined; }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.loading;
  }

  isFavorite(produitId: number): boolean {
    return this.itemsSubject.value.some(item => item.produitId === produitId);
  }

  isPending(produitId: number): boolean { return this.pending.has(produitId); }

  toggle(produit: Produit, imageUrl: string | null = null): Observable<void> {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return EMPTY;
    }
    if (!this.auth.hasRole(Role.CLIENT))
      return throwError(() => new Error('Les favoris sont réservés aux comptes clients.'));
    const id = produit.id;
    if (this.pending.has(id)) return EMPTY;
    const owner = this.ownerId;
    const existing = this.itemsSubject.value.find(item => item.produitId === id);
    this.pending.add(id);
    this.version++;
    if (existing) {
      this.itemsSubject.next(this.itemsSubject.value.filter(item => item.produitId !== id));
      return this.http.delete<void>(`${this.api}/${id}`).pipe(
        catchError(error => {
          if (owner === this.ownerId && !this.isFavorite(id))
            this.itemsSubject.next([existing, ...this.itemsSubject.value]);
          return throwError(() => error);
        }),
        map(() => void 0),
        finalize(() => this.pending.delete(id))
      );
    }
    const optimistic: Favori = {
      id: -id, produitId: id, nom: produit.nom, prix: produit.prix,
      prixPromotion: produit.prixPromotion, imageUrl, actif: produit.actif,
      dateCreation: new Date().toISOString()
    };
    this.itemsSubject.next([optimistic, ...this.itemsSubject.value]);
    return this.http.post<Favori>(`${this.api}/${id}`, {}).pipe(
      tap(saved => {
        if (owner === this.ownerId)
          this.itemsSubject.next(this.itemsSubject.value.map(item => item.produitId === id ? saved : item));
      }),
      catchError(error => {
        if (owner === this.ownerId)
          this.itemsSubject.next(this.itemsSubject.value.filter(item => item.produitId !== id));
        return throwError(() => error);
      }),
      map(() => void 0),
      finalize(() => this.pending.delete(id))
    );
  }
}
