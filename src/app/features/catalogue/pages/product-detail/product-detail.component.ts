import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Couleur,
  ImageProduit,
  Materiau,
  Produit,
  ProduitSuggestion,
  VarianteProduit,
} from '../../../../core/models/catalogue';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { PanierService } from '../../../../core/services/panier.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/models/role';
import { FavorisService } from '../../../../core/services/favoris.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Stock } from '../../../../core/models/stock';
import { StockService } from '../../../../core/services/stock.service';
import { RecentlyViewedService } from '../../../../core/services/recently-viewed.service';
import { ComparatorService } from '../../../../core/services/comparator.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cart = inject(PanierService);
  readonly favoris = inject(FavorisService);
  readonly comparator = inject(ComparatorService);
  private readonly toast = inject(ToastService);
  private readonly stockService = inject(StockService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  produit?: Produit;
  images: ImageProduit[] = [];
  variantes: VarianteProduit[] = [];
  stocks = new Map<number, Stock>();
  materiaux: Materiau[] = [];
  couleurs: Couleur[] = [];
  selectedImage = '';
  loading = true;
  error = '';
  cartError = '';
  adding = false;
  selectedVariantId: number | null = null;
  similarItems: ProduitSuggestion[] = [];
  similarLoading = false;

  constructor() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      distinctUntilChanged(),
      tap(() => {
        this.loading = true;
        this.error = '';
        this.produit = undefined;
        this.similarItems = [];
        this.selectedVariantId = null;
        this.cartError = '';
      }),
      switchMap(id => {
        if (!Number.isInteger(id) || id < 1)
          return of({ id, data: null, error: 'Ce produit est introuvable.' });
        return forkJoin({
          produit: this.catalogue.produit(id),
          images: this.catalogue.imagesProduit(id).pipe(catchError(() => of([] as ImageProduit[]))),
          options: this.catalogue.detailsOptions(id).pipe(
            catchError(() => of({ variantes: [] as VarianteProduit[], materiaux: [] as Materiau[], couleurs: [] as Couleur[] }))
          ),
          stocks: this.stockService.produit(id).pipe(catchError(() => of([] as Stock[])))
        }).pipe(
          map(data => ({ id, data, error: '' })),
          catchError(error => of({ id, data: null, error: httpErrorMessage(error) }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ id, data, error }) => {
      this.loading = false;
      if (!data) { this.error = error; return; }
      this.produit = data.produit;
      this.images = data.images.sort((a, b) => Number(b.principale) - Number(a.principale) || a.ordre - b.ordre);
      this.variantes = data.options.variantes;
      this.stocks = new Map(data.stocks.map(stock => [stock.varianteId, stock]));
      this.materiaux = data.options.materiaux;
      this.couleurs = data.options.couleurs;
      if (this.variantes.length === 1) this.selectedVariantId = this.variantes[0].id;
      this.selectedImage = this.catalogue.imageUrl(this.images[0]);
      if (!this.auth.hasRole(Role.ADMINISTRATEUR)) this.recentlyViewed.record(id);
      this.loadSimilar(id);
    });
  }

  private loadSimilar(id: number): void {
    this.similarLoading = true;
    this.catalogue.similaires(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => { if (this.produit?.id === id) { this.similarItems = items; this.similarLoading = false; } },
      error: () => { if (this.produit?.id === id) { this.similarItems = []; this.similarLoading = false; } }
    });
  }

  imageUrl(image: ImageProduit): string {
    return this.catalogue.imageUrl(image);
  }
  selectImage(image: ImageProduit): void {
    this.selectedImage = this.imageUrl(image);
  }
  isInCart(): boolean {
    return !!this.produit && this.auth.hasRole(Role.CLIENT) && this.cart.hasProduct(this.produit.id);
  }
  canAddToCart(): boolean {
    return this.variantes.length > 0 && (!this.auth.hasRole(Role.CLIENT) || (this.cart.isLoaded() && !this.isInCart())) && (!this.selectedVariantId || this.stockQuantity(this.selectedVariantId) > 0);
  }
  stockQuantity(variantId: number): number { return this.stocks.get(variantId)?.quantite ?? 0; }
  get selectedStock(): Stock | undefined { return this.selectedVariantId ? this.stocks.get(this.selectedVariantId) : undefined; }
  toggleFavori(): void {
    if (!this.produit || this.favoris.isPending(this.produit.id)) return;
    const wasFavorite = this.favoris.isFavorite(this.produit.id);
    this.favoris.toggle(this.produit, this.images[0]?.url || null)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.toast.success(wasFavorite ? 'Produit retiré des favoris.' : 'Produit ajouté aux favoris.'),
        error: error => this.toast.error(httpErrorMessage(error))
      });
  }
  addToCart(): void {
    if (!this.produit || this.adding || !this.canAddToCart()) return;
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    if (!this.auth.hasRole(Role.CLIENT)) {
      this.cartError = 'Le panier est réservé aux comptes clients.';
      return;
    }
    if (this.variantes.length && !this.selectedVariantId) {
      this.cartError = 'Sélectionnez une variante avant l’ajout.';
      return;
    }
    if (!this.selectedVariantId || this.stockQuantity(this.selectedVariantId) < 1) {
      this.cartError = 'Cette variante est en rupture de stock.';
      return;
    }
    this.adding = true;
    this.cartError = '';
    this.cart
      .ajouter({
        produitId: this.produit.id,
        ...(this.selectedVariantId
          ? { varianteId: this.selectedVariantId }
          : {}),
        quantite: 1,
      })
      .pipe(
        finalize(() => {
          this.adding = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.toast.success('Produit ajouté au panier.'),
        error: (error) => {
          this.cartError = httpErrorMessage(error);
          this.toast.error(this.cartError);
        },
      });
  }
  materialName(id: number | null): string {
    return this.materiaux.find((item) => item.id === id)?.nom || 'Standard';
  }
  colorName(id: number | null): string {
    return this.couleurs.find((item) => item.id === id)?.nom || 'Standard';
  }
}
