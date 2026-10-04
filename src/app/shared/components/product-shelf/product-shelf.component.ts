import { Component, DestroyRef, Input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProduitSuggestion } from '../../../core/models/catalogue';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { FavorisService } from '../../../core/services/favoris.service';
import { ToastService } from '../../../core/services/toast.service';
import { httpErrorMessage } from '../../../core/services/http-error';
import { ComparatorService } from '../../../core/services/comparator.service';

@Component({
  selector: 'app-product-shelf',
  standalone: false,
  templateUrl: './product-shelf.component.html',
  styleUrl: './product-shelf.component.css'
})
export class ProductShelfComponent {
  @Input() title = '';
  @Input() eyebrow = '';
  @Input() items: ProduitSuggestion[] = [];
  @Input() loading = false;
  readonly favoris = inject(FavorisService);
  readonly comparator = inject(ComparatorService);
  private readonly catalogue = inject(CatalogueService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  imageUrl(item: ProduitSuggestion): string {
    return this.catalogue.imageUrl(item.imageUrl ? { url: item.imageUrl } : null);
  }

  trackById(_index: number, item: ProduitSuggestion): number { return item.produit.id; }

  toggleFavorite(item: ProduitSuggestion): void {
    if (this.favoris.isPending(item.produit.id)) return;
    const wasFavorite = this.favoris.isFavorite(item.produit.id);
    this.favoris.toggle(item.produit, item.imageUrl)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.toast.success(wasFavorite ? 'Produit retiré des favoris.' : 'Produit ajouté aux favoris.'),
        error: error => this.toast.error(httpErrorMessage(error))
      });
  }
}
