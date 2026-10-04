import { Component, DestroyRef, Input, OnChanges, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, combineLatest, forkJoin, map, of, startWith, switchMap } from 'rxjs';
import { ImageProduit, Produit, ProduitSuggestion } from '../../../core/models/catalogue';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';

@Component({
  selector: 'app-recently-viewed',
  standalone: false,
  templateUrl: './recently-viewed.component.html',
  styleUrl: './recently-viewed.component.css'
})
export class RecentlyViewedComponent implements OnInit, OnChanges {
  @Input() products: Produit[] | null = null;
  @Input() images: Map<number, ImageProduit> | null = null;
  @Input() excludeId: number | null = null;
  private readonly catalogue = inject(CatalogueService);
  private readonly history = inject(RecentlyViewedService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refresh$ = new Subject<void>();
  items: ProduitSuggestion[] = [];
  loading = false;

  ngOnChanges(): void { this.refresh$.next(); }

  ngOnInit(): void {
    combineLatest([this.history.ids$, this.refresh$.pipe(startWith(void 0))])
      .pipe(
        switchMap(([ids]) => {
          if (!ids.some(id => id !== this.excludeId)) {
            this.loading = false;
            return of(null);
          }
          this.loading = true;
          if (this.products !== null) return of({ ids, products: this.products, images: this.images ?? new Map<number, ImageProduit>() });
          return forkJoin({ products: this.catalogue.produits(), images: this.catalogue.images() }).pipe(
            map(({ products, images }) => {
              const primary = new Map<number, ImageProduit>();
              for (const image of images.sort((a, b) => Number(b.principale) - Number(a.principale) || a.ordre - b.ordre))
                if (!primary.has(image.produitId)) primary.set(image.produitId, image);
              return { ids, products, images: primary };
            }),
            catchError(() => of(null))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(data => {
        if (data === null) { this.items = []; this.loading = false; return; }
        const byId = new Map(data.products.map(product => [product.id, product]));
        const validIds = new Set(byId.keys());
        this.items = data.ids.filter(id => id !== this.excludeId && validIds.has(id))
          .map(id => ({ produit: byId.get(id)!, imageUrl: data.images.get(id)?.url ?? null }));
        this.loading = false;
        this.history.prune(validIds);
      });
  }
}
