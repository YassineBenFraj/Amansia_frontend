import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Produit, ProduitRequest } from '../../../../core/models/catalogue';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-admin-products-list',
  standalone: false,
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
})
export class ProductsListComponent {
  private readonly catalogue = inject(CatalogueService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmation = inject(ConfirmationService);
  products: Produit[] = [];
  search = '';
  loading = true;
  error = '';
  message = '';
  constructor() {
    this.load();
  }
  get filteredProducts(): Produit[] {
    const value = this.search.trim().toLowerCase();
    return value
      ? this.products.filter((item) =>
          `${item.nom} ${item.categorieNom} ${item.marque || ''}`
            .toLowerCase()
            .includes(value),
        )
      : this.products;
  }
  load(): void {
    this.loading = true;
    this.catalogue
      .produitsAdmin()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.loading = false;
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
          this.loading = false;
        },
      });
  }
  create(): void {
    void this.router.navigate(['/admin/produits/nouveau']);
  }
  edit(product: Produit): void {
    void this.router.navigate(['/admin/produits', product.id]);
  }
  async toggle(product: Produit): Promise<void> {
    if (!await this.confirmation.ask(`${product.actif ? 'Désactiver' : 'Activer'} le produit « ${product.nom} » ?`)) return;
    const request: ProduitRequest = {
      categorieId: product.categorieId,
      nom: product.nom,
      description: product.description || '',
      prix: product.prix,
      prixPromotion: product.prixPromotion,
      marque: product.marque || '',
      largeur: product.largeur,
      hauteur: product.hauteur,
      profondeur: product.profondeur,
      poids: product.poids,
      personnalisable: product.personnalisable,
      actif: !product.actif,
    };
    this.catalogue
      .modifierProduit(product.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message = 'Statut mis à jour.';
          this.load();
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
  async remove(product: Produit): Promise<void> {
    if (!await this.confirmation.ask(`Désactiver le produit « ${product.nom} » ?`, 'Désactiver')) return;
    this.catalogue
      .supprimerProduit(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.message = 'Produit désactivé.';
          this.load();
        },
        error: (error) => {
          this.error = httpErrorMessage(error);
        },
      });
  }
}
