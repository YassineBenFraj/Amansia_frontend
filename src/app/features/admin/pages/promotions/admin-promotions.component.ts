import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { Produit } from '../../../../core/models/catalogue';
import { Promotion, PromotionRequest } from '../../../../core/models/marketing';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { MarketingService } from '../../../../core/services/marketing.service';
import { ToastService } from '../../../../core/services/toast.service';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({ selector: 'app-admin-promotions', standalone: false, templateUrl: './admin-promotions.component.html', styleUrl: './admin-promotions.component.css' })
export class AdminPromotionsComponent {
  private readonly marketing = inject(MarketingService);
  private readonly catalogue = inject(CatalogueService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  promotions: Promotion[] = [];
  products: Produit[] = [];
  search = '';
  filter = '';
  loading = true;
  saving = false;
  editing = false;
  showForm = false;
  error = '';
  form: PromotionRequest = { produitId: 0, prixPromotion: 0, dateDebut: '', dateFin: '', actif: true };

  constructor() { this.load(); }

  get filtered(): Promotion[] {
    const search = this.search.trim().toLocaleLowerCase();
    return this.promotions.filter(p => (!search || `${p.produitNom} ${p.produitId}`.toLocaleLowerCase().includes(search))
      && (!this.filter || this.status(p) === this.filter));
  }

  status(p: Promotion): string {
    if (!p.actif) return 'Inactive';
    const now = new Date();
    if (p.dateDebut && new Date(p.dateDebut) > now) return 'À venir';
    if (p.dateFin && new Date(p.dateFin) < now) return 'Expirée';
    return 'Active';
  }

  discount(p: Promotion): number { return p.prixNormal > 0 ? Math.round((1 - p.prixPromotion / p.prixNormal) * 100) : 0; }
  add(): void { this.editing = false; this.form = { produitId: 0, prixPromotion: 0, dateDebut: '', dateFin: '', actif: true }; this.showForm = true; this.error = ''; }
  edit(p: Promotion): void {
    this.editing = true;
    this.form = { produitId: p.produitId, prixPromotion: p.prixPromotion, dateDebut: p.dateDebut?.slice(0, 16) || '', dateFin: p.dateFin?.slice(0, 16) || '', actif: p.actif };
    this.showForm = true; this.error = '';
  }
  save(): void {
    const product = this.products.find(p => p.id === Number(this.form.produitId));
    if (this.saving || !product || this.form.prixPromotion < 0 || this.form.prixPromotion >= product.prix
        || !this.form.dateDebut || !this.form.dateFin || this.form.dateFin <= this.form.dateDebut) {
      this.error = 'Vérifiez le produit, le prix promotionnel et la période.';
      return;
    }
    this.saving = true; this.error = '';
    this.marketing.savePromotion({ ...this.form, produitId: product.id }, this.editing)
      .pipe(finalize(() => this.saving = false), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.showForm = false; this.toast.success('Promotion enregistrée.'); this.load(); },
        error: error => this.error = httpErrorMessage(error)
      });
  }
  toggle(p: Promotion): void {
    this.marketing.promotionStatus(p.produitId, !p.actif).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => { this.promotions = this.promotions.map(item => item.produitId === updated.produitId ? updated : item); },
      error: error => this.toast.error(httpErrorMessage(error))
    });
  }
  private load(): void {
    this.loading = true;
    forkJoin({ promotions: this.marketing.promotions(), products: this.catalogue.produitsAdmin() })
      .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: ({ promotions, products }) => { this.promotions = promotions; this.products = products; },
        error: error => this.error = httpErrorMessage(error)
      });
  }
}
