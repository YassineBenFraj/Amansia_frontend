import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { ImageProduit, Produit } from '../../../../core/models/catalogue';
import { Stock } from '../../../../core/models/stock';
import { stockState } from '../../../../core/models/stock-state';
import { productAvailability } from '../../../../core/models/product-availability';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { StockService } from '../../../../core/services/stock.service';

@Component({ selector: 'app-admin-product-detail', standalone: false, templateUrl: './product-detail.component.html', styleUrl: './product-detail.component.css' })
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogue = inject(CatalogueService);
  private readonly stockService = inject(StockService);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  product?: Produit;
  images: ImageProduit[] = [];
  stocks: Stock[] = [];
  imagesUnavailable = false;
  stocksUnavailable = false;
  loading = true;
  error = '';

  constructor() { this.load(); }

  load(): void {
    if (!Number.isInteger(this.id) || this.id < 1) { this.error = 'Produit introuvable.'; this.loading = false; return; }
    this.loading = true;
    this.error = '';
    this.imagesUnavailable = false;
    this.stocksUnavailable = false;
    forkJoin({
      product: this.catalogue.produit(this.id),
      images: this.catalogue.imagesProduit(this.id).pipe(catchError(() => { this.imagesUnavailable = true; return of([] as ImageProduit[]); })),
      stocks: this.stockService.produit(this.id).pipe(catchError(() => { this.stocksUnavailable = true; return of([] as Stock[]); })),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ product, images, stocks }) => {
        this.product = product;
        this.images = [...images].sort((a, b) => Number(b.principale) - Number(a.principale) || a.ordre - b.ordre);
        this.stocks = stocks;
        this.loading = false;
      },
      error: () => { this.error = 'Impossible de charger ce produit. Réessayez dans un instant.'; this.loading = false; },
    });
  }

  imageUrl(image: ImageProduit): string { return this.catalogue.imageUrl(image); }
  get availabilityLabel(): string {
    return { disponible: 'Disponible', rupture: 'Rupture de stock', 'sans-variante': 'Aucune variante' }[productAvailability(this.stocks)];
  }
  stockLabel(stock: Stock): string { return { disponible: 'Disponible', alerte: 'Stock faible', rupture: 'Rupture' }[stockState(stock)]; }
  stockCode(stock: Stock): string { return { disponible: 'DISPONIBLE', alerte: 'STOCK_FAIBLE', rupture: 'RUPTURE' }[stockState(stock)]; }
}
