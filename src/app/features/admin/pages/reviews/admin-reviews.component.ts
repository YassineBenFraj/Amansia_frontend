import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Avis } from '../../../../core/models/avis';
import { AvisService } from '../../../../core/services/avis.service';
import { httpErrorMessage } from '../../../../core/services/http-error';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({ selector: 'app-admin-reviews', standalone: false, templateUrl: './admin-reviews.component.html', styleUrl: './admin-reviews.component.css' })
export class AdminReviewsComponent {
  private readonly service = inject(AvisService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  reviews: Avis[] = [];
  selected?: Avis;
  search = '';
  status = '';
  note = '';
  loading = true;
  updatingId: number | null = null;
  error = '';
  message = '';
  readonly notes = [5, 4, 3, 2, 1];

  constructor() { this.load(); }

  get filtered(): Avis[] {
    const query = this.search.trim().toLowerCase();
    return this.reviews.filter(review =>
      (!this.status || String(review.approuve) === this.status) &&
      (!this.note || review.note === Number(this.note)) &&
      (!query || `${review.id} ${review.produitNom || review.produitId} ${review.utilisateurNom || ''} ${review.commentaire || ''}`.toLowerCase().includes(query)));
  }

  select(review: Avis): void { void this.router.navigate(['/admin/avis', review.id]); }

  moderate(review: Avis, approved: boolean): void {
    this.updatingId = review.id; this.error = ''; this.message = '';
    this.service.moderer(review.id, approved).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => {
        this.replace(updated);
        this.message = approved ? 'Avis approuvé.' : 'Avis masqué.';
        this.updatingId = null;
      },
      error: error => { this.error = httpErrorMessage(error); this.updatingId = null; }
    });
  }

  async remove(review: Avis): Promise<void> {
    if (!await this.confirmation.ask('Supprimer définitivement cet avis ?', 'Supprimer')) return;
    this.updatingId = review.id; this.error = ''; this.message = '';
    this.service.supprimer(review.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(item => item.id !== review.id);
        if (this.selected?.id === review.id) this.selected = undefined;
        this.message = 'Avis supprimé.';
        this.updatingId = null;
      },
      error: error => { this.error = httpErrorMessage(error); this.updatingId = null; }
    });
  }

  private replace(updated: Avis): void {
    this.reviews = this.reviews.map(item => item.id === updated.id ? updated : item);
    if (this.selected?.id === updated.id) this.selected = updated;
  }

  private load(): void {
    this.service.listerTousPourAdmin().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: reviews => { this.reviews = reviews; this.loading = false; },
      error: error => { this.error = httpErrorMessage(error); this.loading = false; }
    });
  }
}
