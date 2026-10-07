import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CodePromo, CodePromoRequest, TypeReduction } from '../../../../core/models/marketing';
import { MarketingService } from '../../../../core/services/marketing.service';
import { ToastService } from '../../../../core/services/toast.service';
import { httpErrorMessage } from '../../../../core/services/http-error';

@Component({ selector: 'app-admin-codes-promo', standalone: false, templateUrl: './admin-codes-promo.component.html', styleUrl: './admin-codes-promo.component.css' })
export class AdminCodesPromoComponent {
  private readonly marketing = inject(MarketingService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  codes: CodePromo[] = [];
  search = '';
  filter = '';
  loading = true;
  saving = false;
  editingId: number | null = null;
  showForm = false;
  error = '';
  form: CodePromoRequest = this.empty();

  constructor() { this.load(); }

  get filtered(): CodePromo[] {
    const query = this.search.trim().toUpperCase();
    return this.codes.filter(code => (!query || code.code.includes(query)) && (!this.filter || this.status(code) === this.filter));
  }
  status(code: CodePromo): string {
    if (!code.actif) return 'Inactif';
    if (code.nombreUtilisationsMax !== null && code.nombreUtilisations >= code.nombreUtilisationsMax) return 'Épuisé';
    const now = new Date();
    if (new Date(code.dateDebut) > now) return 'À venir';
    if (new Date(code.dateFin) < now) return 'Expiré';
    return 'Actif';
  }
  add(): void { this.editingId = null; this.form = this.empty(); this.showForm = true; this.error = ''; }
  edit(code: CodePromo): void {
    this.editingId = code.id;
    this.form = { code: code.code, typeReduction: code.typeReduction, valeur: code.valeur,
      montantMinimum: code.montantMinimum, dateDebut: code.dateDebut.slice(0, 16), dateFin: code.dateFin.slice(0, 16),
      nombreUtilisationsMax: code.nombreUtilisationsMax, nombreUtilisationsParClient: code.nombreUtilisationsParClient, actif: code.actif };
    this.showForm = true; this.error = '';
  }
  save(): void {
    if (this.saving || !this.form.code.trim() || this.form.valeur <= 0 || this.form.montantMinimum < 0
        || !this.form.dateDebut || !this.form.dateFin || this.form.dateFin <= this.form.dateDebut
        || (this.form.typeReduction === 'POURCENTAGE' && this.form.valeur > 100)) {
      this.error = 'Vérifiez le code, la réduction et les dates.'; return;
    }
    this.saving = true; this.error = '';
    this.marketing.saveCode({ ...this.form, code: this.form.code.trim().toUpperCase() }, this.editingId ?? undefined)
      .pipe(finalize(() => this.saving = false), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { this.showForm = false; this.toast.success('Code promo enregistré.'); this.load(); },
        error: error => this.error = httpErrorMessage(error)
      });
  }
  toggle(code: CodePromo): void {
    this.marketing.codeStatus(code.id, !code.actif).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => this.codes = this.codes.map(item => item.id === updated.id ? updated : item),
      error: error => this.toast.error(httpErrorMessage(error))
    });
  }
  private empty(): CodePromoRequest {
    return { code: '', typeReduction: 'POURCENTAGE' as TypeReduction, valeur: 10, montantMinimum: 0,
      dateDebut: '', dateFin: '', nombreUtilisationsMax: null, nombreUtilisationsParClient: 1, actif: true };
  }
  private load(): void {
    this.loading = true;
    this.marketing.codes().pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: codes => this.codes = codes,
      error: error => this.error = httpErrorMessage(error)
    });
  }
}
