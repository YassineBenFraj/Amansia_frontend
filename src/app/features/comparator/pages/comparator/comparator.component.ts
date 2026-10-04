import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { ComparisonProduct } from '../../../../core/models/comparison';
import { Stock } from '../../../../core/models/stock';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { ComparatorService } from '../../../../core/services/comparator.service';
import { StockService } from '../../../../core/services/stock.service';

interface ComparisonColumn { item: ComparisonProduct; stocks: Stock[] | null; }

@Component({
  selector: 'app-comparator',
  standalone: false,
  templateUrl: './comparator.component.html',
  styleUrl: './comparator.component.css'
})
export class ComparatorComponent {
  readonly comparator = inject(ComparatorService);
  private readonly catalogue = inject(CatalogueService);
  private readonly stockService = inject(StockService);
  private readonly destroyRef = inject(DestroyRef);
  columns: ComparisonColumn[] = [];
  loading = true;

  constructor() {
    this.comparator.products$.pipe(
      tap(() => { this.loading = true; }),
      switchMap(items => items.length
        ? forkJoin(items.map(item => this.stockService.produit(item.produit.id).pipe(
            map(stocks => ({ item, stocks } as ComparisonColumn)),
            catchError(() => of({ item, stocks: null } as ComparisonColumn))
          )))
        : of([] as ComparisonColumn[])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(columns => { this.columns = columns; this.loading = false; });
  }

  image(column: ComparisonColumn): string { return this.catalogue.imageUrl(column.item.imageUrl ? { url: column.item.imageUrl } : null); }
  trackById(_index: number, column: ComparisonColumn): number { return column.item.produit.id; }
  dimensions(column: ComparisonColumn): string {
    const { largeur, hauteur, profondeur } = column.item.produit;
    return [largeur, hauteur, profondeur].some(value => value == null)
      ? 'Non renseignées' : `${largeur} × ${hauteur} × ${profondeur} cm`;
  }
  materials(column: ComparisonColumn): string {
    return this.unique(column.stocks?.map(stock => stock.materiau) ?? []).join(', ') || 'Non renseignés';
  }
  colors(column: ComparisonColumn): string {
    return this.unique(column.stocks?.map(stock => stock.couleur) ?? []).join(', ') || 'Non renseignées';
  }
  availability(column: ComparisonColumn): string {
    if (column.stocks === null) return 'Disponibilité indisponible';
    if (!column.stocks.length || column.stocks.every(stock => stock.quantite < 1)) return 'Rupture de stock';
    return column.stocks.some(stock => stock.quantite > stock.seuilAlerte) ? 'En stock' : 'Stock faible';
  }
  availableVariants(column: ComparisonColumn): string {
    const stocks = column.stocks;
    if (!stocks?.length) return '';
    return `${stocks.filter(stock => stock.quantite > 0).length} variante${stocks.filter(stock => stock.quantite > 0).length > 1 ? 's' : ''} disponible${stocks.filter(stock => stock.quantite > 0).length > 1 ? 's' : ''} sur ${stocks.length}`;
  }
  stockLabel(stock: Stock): string {
    return stock.quantite < 1 ? 'Rupture de stock' : stock.quantite <= stock.seuilAlerte ? 'Stock faible' : 'En stock';
  }
  different(field: 'prix' | 'prixPromotion' | 'dimensions' | 'materials' | 'colors' | 'availability'): boolean {
    if (this.columns.length < 2) return false;
    const values = this.columns.map(column => {
      if (field === 'dimensions') return this.dimensions(column);
      if (field === 'materials') return this.materials(column);
      if (field === 'colors') return this.colors(column);
      if (field === 'availability') return this.availability(column);
      return column.item.produit[field];
    });
    return new Set(values).size > 1;
  }
  private unique(values: (string | null)[]): string[] {
    return [...new Set(values.filter((value): value is string => !!value))];
  }
}
