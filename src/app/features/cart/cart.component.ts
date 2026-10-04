import { Component, DestroyRef, inject } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageProduit } from '../../core/models/catalogue';
import { LignePanier, Panier } from '../../core/models/panier';
import { CatalogueService } from '../../core/services/catalogue.service';
import { PanierService } from '../../core/services/panier.service';
import { httpErrorMessage } from '../../core/services/http-error';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { Stock } from '../../core/models/stock';
import { StockService } from '../../core/services/stock.service';

@Component({ selector: 'app-cart', standalone: false, templateUrl: './cart.component.html', styleUrl: './cart.component.css' })
export class CartComponent {
  private readonly cartService = inject(PanierService);
  private readonly catalogue = inject(CatalogueService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly stockService = inject(StockService);
  cart?: Panier;
  images = new Map<number, ImageProduit>();
  stocks = new Map<number, Stock>();
  loading = true;
  error = '';
  message = '';
  pendingLines = new Set<number>();
  clearing = false;

  constructor() { this.load(); }

  changeQuantity(line: LignePanier, delta: number): void {
    const quantity = line.quantite + delta;
    if (quantity < 1 || this.pendingLines.has(line.id)) return;
    this.pendingLines.add(line.id); this.error = '';
    this.cartService.modifier(line.id, quantity).pipe(
      finalize(() => this.pendingLines.delete(line.id)), takeUntilDestroyed(this.destroyRef)
    ).subscribe({ next: cart => { this.cart = cart; }, error: error => { this.error = httpErrorMessage(error); this.toast.error(this.error); } });
  }

  remove(line: LignePanier): void {
    if (this.pendingLines.has(line.id)) return;
    this.pendingLines.add(line.id); this.error = '';
    this.cartService.supprimer(line.id).pipe(
      finalize(() => this.pendingLines.delete(line.id)), takeUntilDestroyed(this.destroyRef)
    ).subscribe({ next: () => { this.loadCartOnly(); this.toast.success('Produit retiré du panier.'); }, error: error => { this.error = httpErrorMessage(error); this.toast.error(this.error); } });
  }

  clear(): void {
    if (this.clearing) return;
    this.clearing = true; this.error = '';
    this.cartService.vider().pipe(
      finalize(() => { this.clearing = false; }), takeUntilDestroyed(this.destroyRef)
    ).subscribe({ next: () => { if (this.cart) this.cart = { ...this.cart, lignes: [], totalGeneral: 0 }; this.toast.success('Panier vidé.'); }, error: error => { this.error = httpErrorMessage(error); this.toast.error(this.error); } });
  }

  prepareCheckout(): void { if (this.cart?.lignes.length) void this.router.navigate(['/checkout']); }
  productImage(id: number): string { return this.catalogue.imageUrl(this.images.get(id)); }
  variantLabel(line: LignePanier): string { return line.variante ? `Réf. ${line.variante.reference}` : 'Modèle standard'; }
  stockQuantity(line: LignePanier): number | null { return line.variante ? this.stocks.get(line.variante.id)?.quantite ?? null : 0; }

  private loadStocks(cart: Panier): void {
    for (const productId of new Set(cart.lignes.map(line => line.produit.id))) {
      this.stockService.produit(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: stocks => { for (const stock of stocks) this.stocks.set(stock.varianteId, stock); },
        error: () => this.toast.error('Disponibilité momentanément indisponible.')
      });
    }
  }

  private load(): void {
    this.loading = true; this.error = '';
    forkJoin({ cart: this.cartService.obtenir(), images: this.catalogue.images() })
      .pipe(finalize(() => { this.loading = false; }), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: ({ cart, images }) => {
        this.cart = cart;
        this.loadStocks(cart);
        for (const image of images.sort((a, b) => Number(b.principale) - Number(a.principale) || a.ordre - b.ordre)) {
          if (!this.images.has(image.produitId)) this.images.set(image.produitId, image);
        }
      }, error: error => { this.error = httpErrorMessage(error); } });
  }

  private loadCartOnly(): void {
    this.cartService.obtenir().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: cart => { this.cart = cart; }, error: error => { this.error = httpErrorMessage(error); }
    });
  }
}
