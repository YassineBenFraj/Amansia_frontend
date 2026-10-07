import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, catchError, combineLatest, debounceTime, distinctUntilChanged, forkJoin, map, merge, of, startWith, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Categorie, ImageProduit, Produit } from '../../../../core/models/catalogue';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { FavorisService } from '../../../../core/services/favoris.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ComparatorService } from '../../../../core/services/comparator.service';

@Component({ selector: 'app-product-list', standalone: false, templateUrl: './product-list.component.html', styleUrl: './product-list.component.css' })
export class ProductListComponent {
  private readonly catalogue = inject(CatalogueService);
  readonly favoris = inject(FavorisService);
  readonly comparator = inject(ComparatorService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();
  private readonly searchReset$ = new Subject<string>();
  private readonly price$ = new BehaviorSubject<{ min: number | null; max: number | null }>({ min: null, max: null });
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly minPriceControl = new FormControl<number | null>(null);
  readonly maxPriceControl = new FormControl<number | null>(null);
  appliedPrice = { min: null as number | null, max: null as number | null };
  priceError = '';
  priceBounds: { minimum: number; maximum: number } | null = null;
  categories: Categorie[] = [];
  produits: Produit[] = [];
  images = new Map<number, ImageProduit>();
  selectedCategory: number | null = null;
  loading = true;
  error = '';
  visibleCount = 12;

  constructor() {
    this.catalogue.bornesPrix().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: bounds => {
        if (bounds.minimum != null && bounds.maximum != null) this.priceBounds = { minimum: bounds.minimum, maximum: bounds.maximum };
      },
      error: () => { /* Numeric fields remain available if the visual range cannot load. */ }
    });
    forkJoin({ categories: this.catalogue.categories(), images: this.catalogue.images() })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: ({ categories, images }) => {
        this.categories = categories;
        for (const image of images.sort((a, b) => Number(b.principale) - Number(a.principale) || a.ordre - b.ordre)) {
          if (!this.images.has(image.produitId)) this.images.set(image.produitId, image);
        }
      }});
    combineLatest([
      this.route.queryParamMap,
      merge(of(this.searchControl.value), this.searchReset$, this.searchControl.valueChanges.pipe(debounceTime(350), distinctUntilChanged())),
      this.price$,
      this.reload$.pipe(startWith(void 0))
    ]).pipe(
      debounceTime(40),
      tap(([params, , price]) => {
        const category = Number(params.get('categorie'));
        this.selectedCategory = Number.isInteger(category) && category > 0 ? category : null;
        this.appliedPrice = price;
        this.loading = true;
        this.error = '';
        this.visibleCount = 12;
      }),
      switchMap(([, value, price]) => {
        return this.catalogue.filtrerProduits({ nom: value, categorie: this.selectedCategory,
          prixMin: price.min, prixMax: price.max }).pipe(
          map(products => ({ products, error: '' })),
          catchError(error => of({ products: [] as Produit[], error: httpErrorMessage(error) }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ products, error }) => {
      this.produits = products;
      this.error = error;
      this.loading = false;
    });
  }

  selectCategory(id: number | null): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { categorie: id }, queryParamsHandling: 'merge' });
  }

  applyPrice(): void {
    const min = this.minPriceControl.value;
    const max = this.maxPriceControl.value;
    if ((min != null && (!Number.isFinite(min) || min < 0)) || (max != null && (!Number.isFinite(max) || max < 0))) {
      this.priceError = 'Saisissez des prix positifs ou nuls.';
      return;
    }
    if (min != null && max != null && min > max) {
      this.priceError = 'Le minimum ne peut pas dépasser le maximum.';
      return;
    }
    this.priceError = '';
    if (min !== this.appliedPrice.min || max !== this.appliedPrice.max) this.price$.next({ min, max });
  }

  get rangeStart(): number {
    if (!this.priceBounds) return 0;
    return Math.min(this.priceBounds.minimum, this.minPriceControl.value ?? this.priceBounds.minimum,
      this.maxPriceControl.value ?? this.priceBounds.minimum);
  }

  get rangeEnd(): number {
    if (!this.priceBounds) return 0;
    return Math.max(this.priceBounds.maximum, this.minPriceControl.value ?? this.priceBounds.maximum,
      this.maxPriceControl.value ?? this.priceBounds.maximum);
  }

  get minPosition(): number { return this.position(this.minPriceControl.value ?? this.rangeStart); }
  get maxPosition(): number { return this.position(this.maxPriceControl.value ?? this.rangeEnd); }

  private position(value: number): number {
    return this.rangeEnd === this.rangeStart ? 0 : 100 * (value - this.rangeStart) / (this.rangeEnd - this.rangeStart);
  }

  onRangeInput(which: 'min' | 'max', event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const rounded = Math.round(raw / 10) * 10;
    const value = raw <= this.rangeStart ? this.rangeStart : raw >= this.rangeEnd ? this.rangeEnd
      : Math.min(this.rangeEnd, Math.max(this.rangeStart, rounded));
    if (which === 'min') this.minPriceControl.setValue(Math.min(value, this.maxPriceControl.value ?? this.rangeEnd));
    else this.maxPriceControl.setValue(Math.max(value, this.minPriceControl.value ?? this.rangeStart));
    this.priceError = '';
  }

  clearPrice(): void {
    this.minPriceControl.setValue(null);
    this.maxPriceControl.setValue(null);
    this.priceError = '';
    if (this.appliedPrice.min != null || this.appliedPrice.max != null) this.price$.next({ min: null, max: null });
  }

  resetFilters(): void {
    this.clearPrice();
    this.searchControl.setValue('', { emitEvent: false });
    this.searchReset$.next('');
    this.selectCategory(null);
  }

  retry(): void { this.reload$.next(); }
  productImage(id: number): string { return this.catalogue.imageUrl(this.images.get(id)); }
  get visibleProducts(): Produit[] { return this.produits.slice(0, this.visibleCount); }
  showMore(): void { this.visibleCount += 12; }

  toggleFavori(produit: Produit, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const wasFavorite = this.favoris.isFavorite(produit.id);
    this.favoris.toggle(produit, this.images.get(produit.id)?.url || null)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.toast.success(wasFavorite ? 'Produit retiré des favoris.' : 'Produit ajouté aux favoris.'),
        error: error => this.toast.error(httpErrorMessage(error))
      });
  }

}
