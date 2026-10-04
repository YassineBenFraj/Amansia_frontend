import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, combineLatest, debounceTime, distinctUntilChanged, forkJoin, map, merge, of, startWith, switchMap, tap } from 'rxjs';
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
  readonly searchControl = new FormControl('', { nonNullable: true });
  categories: Categorie[] = [];
  produits: Produit[] = [];
  images = new Map<number, ImageProduit>();
  selectedCategory: number | null = null;
  loading = true;
  error = '';
  visibleCount = 12;

  constructor() {
    forkJoin({ categories: this.catalogue.categories(), images: this.catalogue.images() })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: ({ categories, images }) => {
        this.categories = categories;
        for (const image of images.sort((a, b) => Number(b.principale) - Number(a.principale) || a.ordre - b.ordre)) {
          if (!this.images.has(image.produitId)) this.images.set(image.produitId, image);
        }
      }});
    combineLatest([
      this.route.queryParamMap,
      merge(of(this.searchControl.value), this.searchControl.valueChanges.pipe(debounceTime(350), distinctUntilChanged())),
      this.reload$.pipe(startWith(void 0))
    ]).pipe(
      tap(([params]) => {
        const category = Number(params.get('categorie'));
        this.selectedCategory = Number.isInteger(category) && category > 0 ? category : null;
        this.loading = true;
        this.error = '';
        this.visibleCount = 12;
      }),
      switchMap(([, value]) => {
        const search = value.trim();
        const category = this.selectedCategory;
        const request = search ? this.catalogue.rechercher(search)
          : category ? this.catalogue.produitsParCategorie(category) : this.catalogue.produits();
        return request.pipe(
          map(products => ({ products: category && search ? products.filter(p => p.categorieId === category) : products, error: '' })),
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
