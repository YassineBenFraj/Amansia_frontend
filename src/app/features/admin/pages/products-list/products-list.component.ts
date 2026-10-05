import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Produit, ProduitRequest } from '../../../../core/models/catalogue';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ImageProduit } from '../../../../core/models/catalogue';
import { catchError, forkJoin, of } from 'rxjs';
import { StockService } from '../../../../core/services/stock.service';
import { Stock } from '../../../../core/models/stock';
import { productAvailability, ProductAvailability } from '../../../../core/models/product-availability';

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
  private readonly stockService = inject(StockService);
  products: Produit[] = [];
  images: ImageProduit[] = [];
  imageByProduct = new Map<number, ImageProduit>();
  stocksByProduct = new Map<number, Stock[]>();
  availabilityReady = false;
  search = '';
  category = '';
  status = '';
  availability = '';
  loading = true;
  error = '';
  message = '';
  constructor() {
    this.load();
  }
  get filteredProducts(): Produit[] {
    const value = this.search.trim().toLowerCase();
    return this.products.filter(item =>
      (!value || `${item.nom} ${item.categorieNom} ${item.marque || ''}`.toLowerCase().includes(value)) &&
      (!this.category || String(item.categorieId) === this.category) &&
      (!this.status || String(item.actif) === this.status) &&
      (!this.availabilityReady || !this.availability || (this.availability === 'disponible' ? this.availabilityState(item) === 'disponible' : this.availabilityState(item) !== 'disponible')));
  }
  get categories(): { id: number; nom: string }[] {
    return [...new Map(this.products.map(item => [item.categorieId, { id: item.categorieId, nom: item.categorieNom }])).values()];
  }
  imageUrl(product: Produit): string {
    return this.catalogue.imageUrl(this.imageByProduct.get(product.id));
  }
  availabilityState(product: Produit): ProductAvailability {
    return productAvailability(this.stocksByProduct.get(product.id) || []);
  }
  availabilityLabel(product: Produit): string {
    return { disponible: 'Disponible', rupture: 'Rupture', 'sans-variante': 'Aucune variante' }[this.availabilityState(product)];
  }
  load(): void {
    this.loading = true;
    this.error = '';
    this.availabilityReady = false;
    forkJoin({
      products: this.catalogue.produitsAdmin(),
      images: this.catalogue.images().pipe(catchError(() => of([] as ImageProduit[]))),
      stocks: this.stockService.adminStocks().pipe(catchError(() => of(null as Stock[] | null))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ products, images, stocks }) => {
          this.products = products;
          this.images = images;
          this.imageByProduct = new Map<number, ImageProduit>();
          images.forEach(image => { if (!this.imageByProduct.has(image.produitId) || image.principale) this.imageByProduct.set(image.produitId, image); });
          this.stocksByProduct = new Map<number, Stock[]>();
          this.availabilityReady = stocks !== null;
          this.availability = this.availabilityReady ? this.availability : '';
          stocks?.forEach(stock => {
            const productStocks = this.stocksByProduct.get(stock.produitId) || [];
            productStocks.push(stock);
            this.stocksByProduct.set(stock.produitId, productStocks);
          });
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
  view(product: Produit): void {
    void this.router.navigate(['/admin/produits', product.id, 'consulter']);
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
