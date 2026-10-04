import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Favori } from '../../core/models/favori';
import { Produit } from '../../core/models/catalogue';
import { CatalogueService } from '../../core/services/catalogue.service';
import { FavorisService } from '../../core/services/favoris.service';
import { httpErrorMessage } from '../../core/services/http-error';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-favoris',
  standalone: false,
  templateUrl: './favoris.component.html',
  styleUrl: './favoris.component.css'
})
export class FavorisComponent {
  readonly favoris = inject(FavorisService);
  private readonly catalogue = inject(CatalogueService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  loading = true;
  error = '';

  constructor() { this.charger(); }

  charger(): void {
    this.loading = true;
    this.error = '';
    this.favoris.charger(true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.loading = false; },
      error: error => { this.error = httpErrorMessage(error); this.loading = false; }
    });
  }

  image(item: Favori): string {
    return this.catalogue.imageUrl(item.imageUrl ? { url: item.imageUrl } : null);
  }

  retirer(item: Favori): void {
    if (this.favoris.isPending(item.produitId)) return;
    const product = { id: item.produitId, nom: item.nom, prix: item.prix,
      prixPromotion: item.prixPromotion, actif: item.actif } as Produit;
    this.error = '';
    this.favoris.toggle(product, item.imageUrl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.toast.success('Produit retiré des favoris.'),
      error: error => { this.error = httpErrorMessage(error); this.toast.error(this.error); }
    });
  }
}
