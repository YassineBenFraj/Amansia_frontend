import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { Produit } from '../models/catalogue';
import { ComparisonAction, ComparisonProduct } from '../models/comparison';
import { CatalogueService } from './catalogue.service';
import { ToastService } from './toast.service';

const STORAGE_KEY = 'amansia.compare-products';
const MAX_PRODUCTS = 3;

type ResolvedProduct = { kind: 'valid'; item: ComparisonProduct } | { kind: 'missing'; id: number } | { kind: 'temporary-error'; id: number };

@Injectable({ providedIn: 'root' })
export class ComparatorService {
  private readonly catalogue = inject(CatalogueService);
  private readonly toast = inject(ToastService);
  private readonly idsSubject = new BehaviorSubject<number[]>(this.read());
  readonly ids$ = this.idsSubject.asObservable();
  readonly count$ = this.ids$.pipe(map(ids => ids.length));
  readonly products$: Observable<ComparisonProduct[]> = this.ids$.pipe(
    switchMap(ids => ids.length ? forkJoin(ids.map(id => this.resolve(id))) : of([] as ResolvedProduct[])),
    tap(results => {
      const missing = new Set(results.filter(result => result.kind === 'missing').map(result => result.id));
      if (missing.size) this.set(this.idsSubject.value.filter(id => !missing.has(id)));
    }),
    map(results => results.filter((result): result is Extract<ResolvedProduct, { kind: 'valid' }> => result.kind === 'valid').map(result => result.item)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  get ids(): number[] { return [...this.idsSubject.value]; }
  has(id: number): boolean { return this.idsSubject.value.includes(id); }

  add(produit: Produit): ComparisonAction {
    if (this.has(produit.id)) { this.toast.info('Ce produit est déjà dans le comparateur.'); return 'already'; }
    if (this.idsSubject.value.length >= MAX_PRODUCTS) { this.toast.info('Vous pouvez comparer jusqu’à 3 meubles.'); return 'full'; }
    if (!Number.isSafeInteger(produit.id) || produit.id < 1 || !produit.actif) return 'full';
    this.set([...this.idsSubject.value, produit.id]);
    this.toast.success('Produit ajouté au comparateur.');
    return 'added';
  }

  toggle(produit: Produit): ComparisonAction {
    if (this.has(produit.id)) { this.remove(produit.id); return 'removed'; }
    return this.add(produit);
  }

  remove(id: number): void {
    if (this.has(id)) { this.set(this.idsSubject.value.filter(item => item !== id)); this.toast.info('Produit retiré du comparateur.'); }
  }

  clear(): void { if (this.idsSubject.value.length) { this.set([]); this.toast.info('Comparateur vidé.'); } }

  private resolve(id: number): Observable<ResolvedProduct> {
    return this.catalogue.produit(id).pipe(
      switchMap(produit => !produit.actif
        ? of({ kind: 'missing', id } as ResolvedProduct)
        : this.catalogue.imagesProduit(id).pipe(
        map(images => {
          const image = [...images].sort((a, b) => Number(b.principale) - Number(a.principale) || a.ordre - b.ordre)[0];
          return { kind: 'valid', item: { produit, imageUrl: image?.url ?? null } } as ResolvedProduct;
        }),
        catchError(() => of({ kind: 'valid', item: { produit, imageUrl: null } } as ResolvedProduct))
      )),
      catchError(error => of({
        kind: error instanceof HttpErrorResponse && [404, 403, 410].includes(error.status) ? 'missing' : 'temporary-error',
        id
      } as ResolvedProduct))
    );
  }

  private set(ids: number[]): void {
    this.idsSubject.next(ids);
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }
    catch { /* Browsing continues if storage is unavailable. */ }
  }

  private read(): number[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed)
        ? [...new Set(parsed.filter((id): id is number => Number.isSafeInteger(id) && id > 0))].slice(0, MAX_PRODUCTS)
        : [];
    } catch { return []; }
  }
}
