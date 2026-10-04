import { Component, DestroyRef, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Categorie, ImageProduit, Produit } from '../../core/models/catalogue';
import { CatalogueService } from '../../core/services/catalogue.service';
import { environment } from '../../../environments/environment';
import { FavorisService } from '../../core/services/favoris.service';
import { httpErrorMessage } from '../../core/services/http-error';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly catalogue = inject(CatalogueService);
  readonly favoris = inject(FavorisService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  categories: Categorie[] = [];
  produits: Produit[] = [];
  allProducts: Produit[] | null = null;
  images = new Map<number, ImageProduit>();
  loading = true;

  constructor() {
    forkJoin({
      categories: this.catalogue.categories(),
      produits: this.catalogue.produits(),
      images: this.catalogue.images(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ categories, produits, images }) => {
          this.categories = categories.slice(0, 4);
          this.produits = produits.slice(0, 4);
          this.allProducts = produits;
          for (const image of images.sort(
            (a, b) =>
              Number(b.principale) - Number(a.principale) || a.ordre - b.ordre,
          )) {
            if (!this.images.has(image.produitId))
              this.images.set(image.produitId, image);
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  productImage(id: number): string {
    return this.catalogue.imageUrl(this.images.get(id));
  }
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
  categoryImage(category: Categorie): string {
    const image = category.image?.trim();
    if (!image) return '/images/salon1.jpg';
    if (/^https?:\/\//i.test(image)) return image;
    if (image.startsWith('/images/')) return image;
    return `${environment.backendUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  }
}
