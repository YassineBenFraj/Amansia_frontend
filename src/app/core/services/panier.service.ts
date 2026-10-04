import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AjouterLignePanierRequest, Panier } from '../models/panier';

@Injectable({ providedIn: 'root' })
export class PanierService {
  private readonly url = `${environment.apiUrl}/panier`;
  private readonly countSubject = new BehaviorSubject(0);
  readonly count$ = this.countSubject.asObservable();
  private readonly productIdsSubject = new BehaviorSubject<ReadonlySet<number>>(new Set<number>());
  readonly productIds$ = this.productIdsSubject.asObservable();
  private cartSnapshot: Panier | null = null;
  private generation = 0;

  constructor(private readonly http: HttpClient) {}

  obtenir(): Observable<Panier> {
    const generation = this.generation;
    return this.http.get<Panier>(this.url).pipe(tap(cart => {
      if (generation === this.generation) this.updateCart(cart);
    }));
  }

  ajouter(request: AjouterLignePanierRequest): Observable<Panier> {
    const generation = this.generation;
    return this.http.post<Panier>(`${this.url}/lignes`, request).pipe(tap(cart => {
      if (generation === this.generation) this.updateCart(cart);
    }));
  }

  modifier(ligneId: number, quantite: number): Observable<Panier> {
    const generation = this.generation;
    return this.http.put<Panier>(`${this.url}/lignes/${ligneId}`, { quantite }).pipe(tap(cart => {
      if (generation === this.generation) this.updateCart(cart);
    }));
  }

  supprimer(ligneId: number): Observable<void> {
    const generation = this.generation;
    return this.http.delete<void>(`${this.url}/lignes/${ligneId}`).pipe(
      tap(() => {
        if (generation === this.generation && this.cartSnapshot) {
          this.cartSnapshot = { ...this.cartSnapshot, lignes: this.cartSnapshot.lignes.filter(line => line.id !== ligneId) };
          this.publishLines(this.cartSnapshot);
        }
      }), map(() => undefined)
    );
  }

  vider(): Observable<void> {
    const generation = this.generation;
    return this.http.delete<void>(this.url).pipe(tap(() => {
      if (generation !== this.generation) return;
      if (this.cartSnapshot) this.cartSnapshot = { ...this.cartSnapshot, lignes: [] };
      this.countSubject.next(0);
      this.productIdsSubject.next(new Set<number>());
    }));
  }

  setCart(cart: Panier): void { this.updateCart(cart); }
  reset(): void {
    this.generation++;
    this.cartSnapshot = null;
    this.countSubject.next(0);
    this.productIdsSubject.next(new Set<number>());
  }

  isLoaded(): boolean { return this.cartSnapshot !== null; }
  hasProduct(produitId: number): boolean { return this.productIdsSubject.value.has(produitId); }

  private updateCart(cart: Panier): void {
    this.cartSnapshot = cart;
    this.publishLines(cart);
  }

  private publishLines(cart: Panier): void {
    this.countSubject.next((cart.lignes || []).reduce((total, line) => total + line.quantite, 0));
    this.productIdsSubject.next(new Set((cart.lignes || []).map(line => line.produit.id)));
  }
}
